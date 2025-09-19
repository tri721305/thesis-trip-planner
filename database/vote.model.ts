import mongoose, { model, models, Schema, Types, Document } from "mongoose";
import Guide from "./guide.model";
import Comment from "./comment.model";

export interface IVote extends Document {
  author: Types.ObjectId;
  actionId: Types.ObjectId;
  actionType: "guide" | "comment";
  voteType: "upvote" | "downvote";
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actionId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ["guide", "comment"],
      required: true,
      index: true,
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "votes",
  }
);

// Create compound unique index to prevent duplicate votes
VoteSchema.index({ author: 1, actionId: 1, actionType: 1 }, { unique: true });

// Additional indexes for performance
VoteSchema.index({ actionId: 1, actionType: 1, voteType: 1 }); // Get vote counts
VoteSchema.index({ author: 1, voteType: 1 }); // Get user's votes

// Middleware to update upvote/downvote counts automatically
VoteSchema.post("save", async function (doc) {
  if (this.isNew) {
    // New vote created
    await updateVoteCounts(doc.actionId, doc.actionType);
  }
});

VoteSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    // Vote updated (changed from upvote to downvote or vice versa)
    await updateVoteCounts(doc.actionId, doc.actionType);
  }
});

VoteSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // Vote deleted
    await updateVoteCounts(doc.actionId, doc.actionType);
  }
});

VoteSchema.post("deleteOne", async function (doc) {
  if (doc) {
    await updateVoteCounts(doc.actionId, doc.actionType);
  }
});

// Helper function to update vote counts
async function updateVoteCounts(actionId: Types.ObjectId, actionType: string) {
  try {
    // Count upvotes and downvotes
    const upvotes = await Vote.countDocuments({
      actionId,
      actionType,
      voteType: "upvote",
    });

    const downvotes = await Vote.countDocuments({
      actionId,
      actionType,
      voteType: "downvote",
    });

    // Update the appropriate model
    if (actionType === "guide") {
      await Guide.findByIdAndUpdate(actionId, {
        upvotes,
        downvotes,
      });
    } else if (actionType === "comment") {
      await Comment.findByIdAndUpdate(actionId, {
        upvotes,
        downvotes,
      });
    }
  } catch (error) {
    console.error("Error updating vote counts:", error);
  }
}

// Static methods
VoteSchema.statics.getVoteCounts = async function (
  actionId: Types.ObjectId,
  actionType: string
) {
  const upvotes = await this.countDocuments({
    actionId,
    actionType,
    voteType: "upvote",
  });

  const downvotes = await this.countDocuments({
    actionId,
    actionType,
    voteType: "downvote",
  });

  return { upvotes, downvotes };
};

VoteSchema.statics.getUserVote = async function (
  userId: Types.ObjectId,
  actionId: Types.ObjectId,
  actionType: string
) {
  return this.findOne({
    author: userId,
    actionId,
    actionType,
  });
};

VoteSchema.statics.toggleVote = async function (
  userId: Types.ObjectId,
  actionId: Types.ObjectId,
  actionType: string,
  voteType: "upvote" | "downvote"
) {
  const existingVote = await this.findOne({
    author: userId,
    actionId,
    actionType,
  });

  if (existingVote) {
    if (existingVote.voteType === voteType) {
      // Same vote type - remove the vote
      await this.findByIdAndDelete(existingVote._id);
      return null;
    } else {
      // Different vote type - update the vote
      existingVote.voteType = voteType;
      await existingVote.save();
      return existingVote;
    }
  } else {
    // No existing vote - create new vote
    const newVote = new this({
      author: userId,
      actionId,
      actionType,
      voteType,
    });
    await newVote.save();
    return newVote;
  }
};

const Vote = models?.Vote || model<IVote>("Vote", VoteSchema);

export default Vote;

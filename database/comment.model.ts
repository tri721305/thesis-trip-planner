import mongoose, { model, models, Schema, Types, Document } from "mongoose";
import Guide from "./guide.model";

export interface IComment extends Document {
  author: Types.ObjectId;
  guide: Types.ObjectId;
  content: string;
  upvotes: number;
  downvotes: number;
  // Additional features for better comment system
  parentComment?: Types.ObjectId; // For nested comments/replies
  replies: Types.ObjectId[]; // Array of reply comment IDs
  isDeleted: boolean; // Soft delete
  editedAt?: Date; // Track if comment was edited
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    guide: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Additional features
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "comments",
  }
);

// Indexes for performance
CommentSchema.index({ guide: 1, createdAt: -1 }); // Get comments for a guide sorted by newest
CommentSchema.index({ guide: 1, upvotes: -1 }); // Get comments for a guide sorted by most upvoted
CommentSchema.index({ author: 1, createdAt: -1 }); // Get user's comments
CommentSchema.index({ parentComment: 1, createdAt: 1 }); // Get replies to a comment
CommentSchema.index({ isDeleted: 1, guide: 1 }); // Filter deleted comments

// Middleware to update guide comment count
CommentSchema.post("save", async function (doc) {
  if (this.isNew && !doc.isDeleted && !doc.parentComment) {
    // Only increment for new top-level comments (not replies)
    await Guide.findByIdAndUpdate(doc.guide, { $inc: { comments: 1 } });
  }
});

CommentSchema.post("findOneAndUpdate", async function (doc) {
  const update = this.getUpdate() as any;
  if (doc && update?.isDeleted === true && !doc.parentComment) {
    // Decrement when top-level comment is soft deleted
    await Guide.findByIdAndUpdate(doc.guide, { $inc: { comments: -1 } });
  }
});

// Methods
CommentSchema.methods.addReply = function (replyId: Types.ObjectId) {
  if (!this.replies.includes(replyId)) {
    this.replies.push(replyId);
    return this.save();
  }
};

CommentSchema.methods.removeReply = function (replyId: Types.ObjectId) {
  this.replies = this.replies.filter(
    (id: Types.ObjectId) => !id.equals(replyId)
  );
  return this.save();
};

CommentSchema.methods.markAsEdited = function () {
  this.editedAt = new Date();
  return this.save();
};

CommentSchema.methods.softDelete = function () {
  this.isDeleted = true;
  return this.save();
};

const Comment = models?.Comment || model<IComment>("Comment", CommentSchema);

export default Comment;

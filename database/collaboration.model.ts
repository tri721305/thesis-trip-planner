import { Schema, model, models, Types } from "mongoose";

// Collaboration Management
export interface ICollaboration {
  _id: Types.ObjectId;
  travelPlanId: Types.ObjectId;
  user: Types.ObjectId;

  // Permissions
  role: "owner" | "editor" | "viewer" | "commenter";
  permissions: {
    editItinerary: boolean;
    addPlaces: boolean;
    editBudget: boolean;
    addExpenses: boolean;
    inviteOthers: boolean;
    changeSettings: boolean;
  };

  // Status
  status: "pending" | "accepted" | "declined" | "removed";
  invitedBy: Types.ObjectId;
  joinedAt?: Date;

  // Invitation
  invitationToken?: string;
  invitationExpiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CollaborationSchema = new Schema<ICollaboration>(
  {
    travelPlanId: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Permissions
    role: {
      type: String,
      enum: ["owner", "editor", "viewer", "commenter"],
      required: true,
    },
    permissions: {
      editItinerary: { type: Boolean, default: true },
      addPlaces: { type: Boolean, default: true },
      editBudget: { type: Boolean, default: false },
      addExpenses: { type: Boolean, default: true },
      inviteOthers: { type: Boolean, default: false },
      changeSettings: { type: Boolean, default: false },
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "removed"],
      default: "pending",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: { type: Date },

    // Invitation
    invitationToken: { type: String, unique: true, sparse: true },
    invitationExpiresAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
CollaborationSchema.index({ travelPlanId: 1 });
CollaborationSchema.index({ user: 1 });
CollaborationSchema.index({ status: 1 });
CollaborationSchema.index({ invitationToken: 1 });

// Compound index to prevent duplicate collaborations
CollaborationSchema.index({ travelPlanId: 1, user: 1 }, { unique: true });

// Middleware to set permissions based on role
CollaborationSchema.pre("save", function (next) {
  switch (this.role) {
    case "owner":
      this.permissions = {
        editItinerary: true,
        addPlaces: true,
        editBudget: true,
        addExpenses: true,
        inviteOthers: true,
        changeSettings: true,
      };
      break;
    case "editor":
      this.permissions = {
        editItinerary: true,
        addPlaces: true,
        editBudget: false,
        addExpenses: true,
        inviteOthers: false,
        changeSettings: false,
      };
      break;
    case "viewer":
      this.permissions = {
        editItinerary: false,
        addPlaces: false,
        editBudget: false,
        addExpenses: false,
        inviteOthers: false,
        changeSettings: false,
      };
      break;
    case "commenter":
      this.permissions = {
        editItinerary: false,
        addPlaces: false,
        editBudget: false,
        addExpenses: false,
        inviteOthers: false,
        changeSettings: false,
      };
      break;
  }
  next();
});

const Collaboration =
  models?.Collaboration ||
  model<ICollaboration>("Collaboration", CollaborationSchema);
export default Collaboration;

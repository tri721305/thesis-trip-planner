import { model, models, Schema, Types } from "mongoose";

export interface IChecklist {
  name: string;
}

const ChecklistSchema = new Schema<IChecklist>(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Checklist =
  models?.Checklist || model<IChecklist>("Checklist", ChecklistSchema);

export default Checklist;

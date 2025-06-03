import { model, models, Schema, Types } from "mongoose";

export interface IInteraction {}

const InteractionSchema = new Schema<IInteraction>({}, { timestamps: true });

const Interaction =
  models?.Interaction || model<IInteraction>("Interaction", InteractionSchema);

export default Interaction;

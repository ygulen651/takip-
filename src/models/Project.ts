import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  clientId: mongoose.Types.ObjectId;
  status: "ACTIVE" | "DONE";
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DONE"],
      default: "ACTIVE",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ status: 1 });

export const Project = models.Project || model<IProject>("Project", ProjectSchema);


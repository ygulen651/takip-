import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: Date;
  deliveryLink?: string;
  deliveredAt?: Date;
  completedAt?: Date;
  price: number;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  paidAmount: number;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"],
      default: "BACKLOG",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    dueDate: {
      type: Date,
    },
    deliveryLink: {
      type: String,
    },
    deliveredAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID"],
      default: "PENDING",
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ paymentStatus: 1 });
TaskSchema.index({ dueDate: 1 });

export const Task = models.Task || model<ITask>("Task", TaskSchema);


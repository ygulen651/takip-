import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITaskComment extends Document {
  _id: string;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const TaskCommentSchema = new Schema<ITaskComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

TaskCommentSchema.index({ taskId: 1, createdAt: -1 });

export const TaskComment = models.TaskComment || model<ITaskComment>("TaskComment", TaskCommentSchema);


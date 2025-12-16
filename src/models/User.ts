import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "EMPLOYEE";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });

export const User = models.User || model<IUser>("User", UserSchema);


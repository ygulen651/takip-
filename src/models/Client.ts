import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IClient extends Document {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Client = models.Client || model<IClient>("Client", ClientSchema);


import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDigestCache extends Document {
  userId: Types.ObjectId;
  digestText: string;
  generatedAt: Date;
  basedOnThreadIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export const DigestCacheSchema = new Schema<IDigestCache>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    digestText: { type: String, required: true },
    generatedAt: { type: Date, required: true },
    basedOnThreadIds: [{ type: Schema.Types.ObjectId, ref: "Thread" }],
  },
  { timestamps: true }
);

export const DigestCache =
  mongoose.models.DigestCache ||
  mongoose.model<IDigestCache>("DigestCache", DigestCacheSchema);

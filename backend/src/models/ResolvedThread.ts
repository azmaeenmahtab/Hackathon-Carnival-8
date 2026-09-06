import mongoose, { Schema, Document, Types } from "mongoose";
import {
  ThreadCategory,
  ThreadUrgency,
  IMessage,
  MessageSchema,
} from "./Thread.js";

export interface IResolvedThread extends Document {
  userId: Types.ObjectId;
  originalThreadId: Types.ObjectId;
  externalThreadId: string;
  subject: string;
  participants: string[];
  messages: IMessage[];
  messageCount: number;
  category: ThreadCategory;
  correctedCategory: ThreadCategory | null;
  urgency: ThreadUrgency;
  actionNeeded: boolean;
  deadline: Date | null;
  aiExplanation: string;
  isRead: boolean;
  resolvedAt: Date;
  resolutionNote?: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const ResolvedThreadSchema = new Schema<IResolvedThread>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalThreadId: { type: Schema.Types.ObjectId, required: true },
    externalThreadId: { type: String, required: true },
    subject: { type: String, required: true },
    participants: [{ type: String, required: true }],
    messages: [MessageSchema],
    messageCount: { type: Number, default: 1 },
    category: { type: String, required: true },
    correctedCategory: { type: String, default: null },
    urgency: { type: String, required: true },
    actionNeeded: { type: Boolean, default: false },
    deadline: { type: Date, default: null },
    aiExplanation: { type: String, default: "" },
    isRead: { type: Boolean, default: true },
    resolvedAt: { type: Date, default: Date.now, index: true },
    resolutionNote: { type: String, default: "Marked resolved by faculty" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "resolved_threads",
  }
);

export const ResolvedThread = mongoose.model<IResolvedThread>(
  "ResolvedThread",
  ResolvedThreadSchema
);

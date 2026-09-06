import mongoose, { Schema, Document, Types } from "mongoose";

export const THREAD_CATEGORIES = [
  "Meeting",
  "Class/Schedule",
  "Student Issue",
  "Examination",
  "Re-evaluation",
  "Committee/Admin",
  "Other",
] as const;

export type ThreadCategory = (typeof THREAD_CATEGORIES)[number];

export const THREAD_URGENCIES = ["Low", "Medium", "High", "Critical"] as const;
export type ThreadUrgency = (typeof THREAD_URGENCIES)[number];

export interface IMessage {
  _id?: Types.ObjectId;
  sender: string;
  senderIsFaculty: boolean;
  sentAt: Date;
  body: string;
}

export interface IThread extends Document {
  userId: Types.ObjectId;
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
  classificationStatus: "pending" | "completed" | "failed";
  classificationError: string | null;
  isRead: boolean;
  needsFollowUp: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: String, required: true },
    senderIsFaculty: { type: Boolean, required: true },
    sentAt: { type: Date, required: true },
    body: { type: String, required: true },
  },
  { _id: true, timestamps: false }
);

export const ThreadSchema = new Schema<IThread>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    externalThreadId: { type: String, required: true },
    subject: { type: String, required: true },
    participants: [{ type: String }],

    messages: { type: [MessageSchema], default: [] },
    messageCount: { type: Number, default: 0 },

    category: {
      type: String,
      enum: THREAD_CATEGORIES,
      required: true,
      index: true,
    },
    correctedCategory: {
      type: String,
      enum: [...THREAD_CATEGORIES, null],
      default: null,
    },

    urgency: {
      type: String,
      enum: THREAD_URGENCIES,
      required: true,
      index: true,
    },
    actionNeeded: { type: Boolean, default: false },
    deadline: { type: Date, default: null },
    aiExplanation: { type: String, required: true },

    classificationStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    classificationError: { type: String, default: null },

    isRead: { type: Boolean, default: false, index: true },
    needsFollowUp: { type: Boolean, default: false, index: true },

    lastMessageAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

ThreadSchema.index({ userId: 1, externalThreadId: 1 }, { unique: true });
ThreadSchema.index({ userId: 1, urgency: 1, lastMessageAt: -1 });

export const Thread =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", ThreadSchema);

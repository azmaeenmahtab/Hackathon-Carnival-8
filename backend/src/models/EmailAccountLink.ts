import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmailAccountLink extends Document {
  userId: Types.ObjectId;
  provider: "mock" | "gmail";
  gmailAccessTokenEncrypted: string | null;
  gmailRefreshTokenEncrypted: string | null;
  lastSyncedAt: Date | null;
  syncStatus: "idle" | "syncing" | "error";
  createdAt: Date;
  updatedAt: Date;
}

export const EmailAccountLinkSchema = new Schema<IEmailAccountLink>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    provider: { type: String, enum: ["mock", "gmail"], default: "mock" },
    gmailAccessTokenEncrypted: { type: String, default: null },
    gmailRefreshTokenEncrypted: { type: String, default: null },
    lastSyncedAt: { type: Date, default: null },
    syncStatus: {
      type: String,
      enum: ["idle", "syncing", "error"],
      default: "idle",
    },
  },
  { timestamps: true }
);

export const EmailAccountLink =
  mongoose.models.EmailAccountLink ||
  mongoose.model<IEmailAccountLink>("EmailAccountLink", EmailAccountLinkSchema);

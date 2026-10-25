import { google, gmail_v1 } from "googleapis";
import mongoose from "mongoose";
import { IngestionProvider, RawThread, RawMessage } from "./IngestionProvider.js";
import { EmailAccountLink } from "../../models/EmailAccountLink.js";
import { decrypt } from "../../utils/crypto.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

/**
 * Extracts readable plain-text content from Gmail message payload parts.
 * Decodes base64url data and cleans up extra whitespace.
 */
function extractBodyFromPart(part?: gmail_v1.Schema$MessagePart): string {
  if (!part) return "";

  // If this part is plain text and has body data, decode it
  if (part.mimeType === "text/plain" && part.body?.data) {
    return Buffer.from(part.body.data, "base64url").toString("utf-8").trim();
  }

  // If this part contains subparts, search through them
  if (part.parts && part.parts.length > 0) {
    // Priority: look for text/plain first
    for (const sub of part.parts) {
      if (sub.mimeType === "text/plain" && sub.body?.data) {
        return Buffer.from(sub.body.data, "base64url").toString("utf-8").trim();
      }
    }
    // Fallback: search recursively
    for (const sub of part.parts) {
      const text = extractBodyFromPart(sub);
      if (text) return text;
    }
    // Fallback: look for text/html and strip tags
    for (const sub of part.parts) {
      if (sub.mimeType === "text/html" && sub.body?.data) {
        const html = Buffer.from(sub.body.data, "base64url").toString("utf-8");
        return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }
    }
  }

  // Fallback: if main part is text/html
  if (part.mimeType === "text/html" && part.body?.data) {
    const html = Buffer.from(part.body.data, "base64url").toString("utf-8");
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  return "";
}

/**
 * Production Gmail Ingestion Provider
 * Connects to the official Gmail REST API using OAuth2 refresh tokens,
 * fetches real active threads, extracts full message bodies, and formats into RawThread[].
 */
export class GmailIngestionProvider implements IngestionProvider {
  name = "gmail";

  async fetchThreads(userId: string): Promise<RawThread[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Retrieve the linked account
    const link = await EmailAccountLink.findOne({
      userId: userObjectId,
      provider: "gmail",
    });

    if (!link || !link.gmailRefreshTokenEncrypted) {
      throw new Error("No connected Gmail account found. Please link your Gmail account first.");
    }

    const refreshToken = decrypt(link.gmailRefreshTokenEncrypted);

    // 2. Set up authenticated OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      env.GMAIL_CLIENT_ID,
      env.GMAIL_CLIENT_SECRET,
      env.GMAIL_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // 3. List recent threads from INBOX
    logger.info({ userId }, "Fetching recent inbox threads from Gmail API");
    const listResponse = await gmail.users.threads.list({
      userId: "me",
      maxResults: 15,
      q: "label:INBOX",
    });

    const threadSummaries = listResponse.data.threads || [];
    if (threadSummaries.length === 0) {
      logger.info({ userId }, "No active threads returned by Gmail API");
      return [];
    }

    const rawThreads: RawThread[] = [];

    // 4. Fetch full messages for each thread
    for (const summary of threadSummaries) {
      if (!summary.id) continue;

      try {
        const fullThread = await gmail.users.threads.get({
          userId: "me",
          id: summary.id,
          format: "full",
        });

        const messages: RawMessage[] = [];
        let threadSubject = "(No Subject)";
        const participantsSet = new Set<string>();

        const gmailMessages = fullThread.data.messages || [];

        for (const msg of gmailMessages) {
          const headers = msg.payload?.headers || [];
          const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "Unknown Sender";
          const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "";
          const dateStr = headers.find((h) => h.name?.toLowerCase() === "date")?.value;
          const sentAt = dateStr ? new Date(dateStr) : new Date();

          if (subject && threadSubject === "(No Subject)") {
            threadSubject = subject;
          }

          participantsSet.add(from);

          // Extract text content
          let bodyText = extractBodyFromPart(msg.payload);
          if (!bodyText && msg.snippet) {
            bodyText = msg.snippet;
          }

          messages.push({
            sender: from,
            senderIsFaculty: false,
            sentAt,
            body: bodyText.substring(0, 4000), // Clean limit to preserve LLM token context
          });
        }

        if (messages.length > 0) {
          rawThreads.push({
            externalThreadId: `gmail-${summary.id}`,
            subject: threadSubject,
            participants: Array.from(participantsSet),
            messages,
            lastMessageAt: messages[messages.length - 1].sentAt,
          });
        }
      } catch (err: any) {
        logger.warn(
          { threadId: summary.id, error: err.message },
          "Failed to fetch individual Gmail thread, skipping"
        );
      }
    }

    logger.info(
      { userId, threadCount: rawThreads.length },
      "Successfully fetched and parsed Gmail threads"
    );

    return rawThreads;
  }
}

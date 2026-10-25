import { Router, Request, Response } from "express";
import { google } from "googleapis";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { EmailAccountLink } from "../models/EmailAccountLink.js";
import { encrypt } from "../utils/crypto.js";
import { logger } from "../utils/logger.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const router = Router();

function getOAuth2Client() {
  return new google.auth.OAuth2(
    env.GMAIL_CLIENT_ID,
    env.GMAIL_CLIENT_SECRET,
    env.GMAIL_REDIRECT_URI
  );
}

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

/**
 * 1. Generate Google OAuth consent URL
 * Protected by requireAuth so we can bind the user ID in the OAuth state parameter.
 */
router.get("/connect", requireAuth, (req: Request, res: Response) => {
  try {
    if (!env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET) {
      return sendError(
        res,
        "CONFIGURATION_ERROR",
        "Gmail OAuth credentials (GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET) are not configured.",
        500
      );
    }

    const oauth2Client = getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Essential: forces Google to provide a refresh_token
      scope: GMAIL_SCOPES,
      state: req.user!.id,
    });

    return sendSuccess(res, { url });
  } catch (err: any) {
    logger.error({ error: err.message }, "Failed to generate Google auth URL");
    return sendError(res, "OAUTH_URL_ERROR", "Could not generate Google authorization URL", 500);
  }
});

/**
 * 2. OAuth Callback
 * Google redirects here with ?code=...&state=...
 */
router.get("/callback", async (req: Request, res: Response) => {
  const { code, state: userId, error } = req.query;

  const frontendUrl = env.CORS_ORIGIN || "http://localhost:3000";

  if (error) {
    logger.warn({ error }, "User declined Google OAuth consent");
    return res.redirect(`${frontendUrl}/?gmail_error=access_denied`);
  }

  if (!code || !userId) {
    logger.warn("Missing code or state in Google OAuth callback");
    return res.redirect(`${frontendUrl}/?gmail_error=missing_params`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(String(code));

    oauth2Client.setCredentials(tokens);

    // Fetch user profile info (to get connected email address)
    let connectedEmail: string | null = null;
    try {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      connectedEmail = userInfo.data.email || null;
    } catch (e: any) {
      logger.warn({ error: e.message }, "Could not fetch Google userinfo");
    }

    const userObjectId = new mongoose.Types.ObjectId(String(userId));

    const updateFields: any = {
      userId: userObjectId,
      provider: "gmail",
      connectedEmail,
      syncStatus: "idle",
    };

    if (tokens.refresh_token) {
      updateFields.gmailRefreshTokenEncrypted = encrypt(tokens.refresh_token);
    }
    if (tokens.access_token) {
      updateFields.gmailAccessTokenEncrypted = encrypt(tokens.access_token);
    }

    await EmailAccountLink.findOneAndUpdate(
      { userId: userObjectId },
      updateFields,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info({ userId, connectedEmail }, "Successfully linked Gmail account via OAuth");

    return res.redirect(`${frontendUrl}/?gmail_connected=true`);
  } catch (err: any) {
    logger.error({ error: err.message }, "Failed to exchange Google OAuth code");
    return res.redirect(
      `${frontendUrl}/?gmail_error=${encodeURIComponent(err.message || "token_exchange_failed")}`
    );
  }
});

/**
 * 3. Status check: is user's Gmail connected?
 */
router.get("/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user!.id);
    const link = await EmailAccountLink.findOne({
      userId: userObjectId,
      provider: "gmail",
    });

    const isConnected = Boolean(link && link.gmailRefreshTokenEncrypted);

    return sendSuccess(res, {
      connected: isConnected,
      connectedEmail: link?.connectedEmail || null,
      lastSyncedAt: link?.lastSyncedAt || null,
      syncStatus: link?.syncStatus || "idle",
    });
  } catch (err: any) {
    return sendError(res, "GMAIL_STATUS_ERROR", err.message, 500);
  }
});

/**
 * 4. Disconnect Gmail link
 */
router.post("/disconnect", requireAuth, async (req: Request, res: Response) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user!.id);
    await EmailAccountLink.deleteOne({ userId: userObjectId, provider: "gmail" });

    logger.info({ userId: req.user!.id }, "Disconnected Gmail account");
    return sendSuccess(res, { message: "Gmail account disconnected successfully" });
  } catch (err: any) {
    return sendError(res, "DISCONNECT_ERROR", err.message, 500);
  }
});

export default router;

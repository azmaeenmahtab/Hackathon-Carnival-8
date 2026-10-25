import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import mongoose from "mongoose";
import { auth } from "../config/betterAuth.js";
import { sendError } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      session?: any;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      };
      req.session = session.session;
      return next();
    }

    // Dev convenience fallback: allow mock dev faculty user if specified in header or development
    if (env.NODE_ENV === "development" && req.headers["x-dev-user-id"]) {
      req.user = {
        id: String(req.headers["x-dev-user-id"]),
        email: "faculty@university.edu",
        name: "Dr. Eleanor Vance",
      };
      return next();
    }

    // Direct token fallback: handles cross-origin Vercel requests when third-party cookies are partitioned or blocked
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (!token && req.headers["x-session-token"]) {
      token = String(req.headers["x-session-token"]).trim();
    }

    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]).split(".")[0];
      }
    }

    if (token) {
      const client = mongoose.connection.getClient();
      const db = client ? client.db(env.MONGODB_DB_NAME) : null;
      if (db) {
        const dbSession = await db.collection("session").findOne({
          token,
          expiresAt: { $gt: new Date() },
        });

        if (dbSession) {
          let userQuery: any = { id: dbSession.userId };
          if (mongoose.Types.ObjectId.isValid(dbSession.userId)) {
            userQuery = {
              $or: [
                { id: dbSession.userId },
                { _id: new mongoose.Types.ObjectId(dbSession.userId) },
              ],
            };
          }

          const dbUser = await db.collection("user").findOne(userQuery);
          if (dbUser) {
            req.user = {
              id: String(dbUser.id || dbUser._id),
              email: dbUser.email,
              name: dbUser.name,
            };
            req.session = dbSession;
            return next();
          }
        }
      }
    }

    return sendError(
      res,
      "UNAUTHENTICATED",
      "Valid authentication session required",
      401
    );
  } catch (error) {
    // If auth verification fails, handle as unauthenticated
    return sendError(
      res,
      "UNAUTHENTICATED",
      "Authentication session verification failed",
      401
    );
  }
}

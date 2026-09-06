import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
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

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sendError } from "./utils/apiResponse.js";

import mongoose from "mongoose";
import { connectDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import threadsRoutes from "./routes/threads.routes.js";
import digestRoutes from "./routes/digest.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import googleAuthRoutes from "./routes/googleAuth.routes.js";

const app = express();

// 1. Security headers (Helmet)
app.use((helmet as any)());

// 2. CORS with credentials
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or direct browser checks)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes("*") ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    exposedHeaders: ["set-auth-token", "Set-Cookie"],
  })
);

// 3. Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 4. Global light rate limiting
app.use(globalRateLimiter);

// 5. Database connection middleware (ensures connection in serverless / Vercel execution)
app.use(async (req, res, next) => {
  // Fast path: Don't block root status check or health route on database connection
  if (req.path === "/" || req.path === "/api/health") {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    try {
      // Connect with a 5-second timeout safeguard to prevent Vercel function timeout
      await Promise.race([
        connectDB(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("MongoDB connection timeout after 5s")), 5000)
        ),
      ]);
    } catch (err: any) {
      return sendError(
        res,
        "DATABASE_UNAVAILABLE",
        `Database connection failed: ${err?.message || "Check MONGODB_URI in Vercel environment variables"}`,
        503
      );
    }
  }
  next();
});

// Root welcome / status route
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    name: "FacultyInbox AI API",
    version: "1.0.0",
    db: mongoose.connection.readyState === 1 ? "connected" : "pending_or_disconnected",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      threads: "/api/threads",
      digest: "/api/digest",
      stats: "/api/stats",
      sync: "/api/sync",
    },
  });
});

// 5. Unauthenticated / System routes
app.use("/api/health", healthRoutes);
app.use("/api/auth/google", googleAuthRoutes);
app.use("/api/google", googleAuthRoutes);
app.use("/api/auth", authRoutes);

// 6. Authenticated API routes
app.use("/api/threads", requireAuth, threadsRoutes);
app.use("/api/digest", requireAuth, digestRoutes);
app.use("/api/stats", requireAuth, statsRoutes);
app.use("/api/sync", requireAuth, syncRoutes);

// 7. 404 Handler
app.use((req, res) => {
  return sendError(res, "ROUTE_NOT_FOUND", `Cannot ${req.method} ${req.path}`, 404);
});

// 8. Centralized error handling (Must be last)
app.use(errorHandler);

export default app;

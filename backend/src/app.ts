import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sendError } from "./utils/apiResponse.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import threadsRoutes from "./routes/threads.routes.js";
import digestRoutes from "./routes/digest.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import syncRoutes from "./routes/sync.routes.js";

const app = express();

// 1. Security headers (Helmet)
app.use(helmet());

// 2. CORS with credentials
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: origin not allowed"));
    },
    credentials: true,
  })
);

// 3. Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 4. Global light rate limiting
app.use(globalRateLimiter);

// 5. Unauthenticated / System routes
app.use("/api/health", healthRoutes);
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

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import {
  startResolvedThreadCleanupScheduler,
  stopResolvedThreadCleanupScheduler,
} from "./utils/resolvedThreadCleanup.js";

async function bootstrap() {
  try {
    // 1. Start HTTP listener first so health checks & requests are accepted
    const server = app.listen(env.PORT, () => {
      logger.info(
        `FacultyInbox AI Express server running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
    });

    // 2. Connect Database asynchronously with informative logging
    connectDB()
      .then(() => {
        logger.info("Database connection established successfully.");

        // 3. Start resolved-thread expiry scheduler (7-day TTL sweep)
        startResolvedThreadCleanupScheduler();
      })
      .catch((error) => {
        logger.warn(
          { error: error.message },
          `MongoDB connection pending/failed on ${env.MONGODB_URI}. Ensure MongoDB service is started if running locally.`
        );
      });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Closing HTTP server cleanly...`);
      stopResolvedThreadCleanupScheduler();
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error({ err: error }, "Failed to bootstrap server");
    process.exit(1);
  }
}

bootstrap();


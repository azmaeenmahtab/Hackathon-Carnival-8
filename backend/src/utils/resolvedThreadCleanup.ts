/**
 * resolvedThreadCleanup.ts
 *
 * Belt-and-suspenders cleanup job for resolved threads older than 7 days.
 *
 * PRIMARY mechanism: MongoDB TTL index on `resolvedAt` (expireAfterSeconds: 604800)
 *   → MongoDB's background reaper runs every ~60 s and deletes expired docs automatically.
 *
 * SECONDARY mechanism (this file): runs once at startup and then every 24 h.
 *   → Catches any edge cases (e.g. TTL index not yet created, Atlas free-tier delays).
 *   → Logs deleted count for audit trail.
 */

import { ResolvedThread } from "../models/ResolvedThread.js";
import { logger } from "./logger.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 604 800 000 ms
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // run daily

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Deletes resolved threads whose `resolvedAt` timestamp is older than 7 days.
 * Safe to call multiple times — idempotent.
 */
export async function pruneOldResolvedThreads(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);

    const result = await ResolvedThread.deleteMany({
      resolvedAt: { $lt: cutoff },
    });

    if (result.deletedCount > 0) {
      logger.info(
        { deletedCount: result.deletedCount, cutoff },
        `[Cleanup] Pruned ${result.deletedCount} resolved thread(s) older than 7 days.`
      );
    } else {
      logger.info(
        { cutoff },
        "[Cleanup] No expired resolved threads found — inbox archive is fresh."
      );
    }
  } catch (err) {
    // Non-fatal — log and continue. TTL index will catch it next cycle.
    logger.warn(
      { err },
      "[Cleanup] Could not prune old resolved threads (non-fatal). TTL index will handle cleanup."
    );
  }
}

/**
 * Starts the daily cleanup scheduler.
 * Call this once after the database connection is established.
 */
export function startResolvedThreadCleanupScheduler(): void {
  // Run immediately on startup (catches any backlog)
  pruneOldResolvedThreads();

  // Then run every 24 hours
  cleanupTimer = setInterval(pruneOldResolvedThreads, CLEANUP_INTERVAL_MS);

  // Prevent timer from keeping Node process alive unnecessarily
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  logger.info(
    "[Cleanup] Resolved-thread expiry scheduler started (7-day TTL, daily sweep)."
  );
}

/**
 * Stops the cleanup scheduler (useful for graceful shutdown / tests).
 */
export function stopResolvedThreadCleanupScheduler(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    logger.info("[Cleanup] Resolved-thread expiry scheduler stopped.");
  }
}

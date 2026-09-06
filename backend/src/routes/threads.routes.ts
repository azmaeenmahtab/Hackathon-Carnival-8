import { Router } from "express";
import { z } from "zod";
import {
  listThreads,
  getThreadById,
  markRead,
  reclassify,
  getFollowUp,
  getOther,
  ingestIncomingEmail,
  resolveThread,
  listResolvedThreads,
  restoreResolvedThread,
} from "../controllers/threads.controller.js";
import { validate } from "../middleware/validate.js";
import { THREAD_CATEGORIES } from "../models/Thread.js";
import { pruneOldResolvedThreads } from "../utils/resolvedThreadCleanup.js";

const router = Router();

const markReadSchema = {
  body: z.object({
    isRead: z.boolean(),
  }),
};

const reclassifySchema = {
  body: z.object({
    category: z.enum(THREAD_CATEGORIES),
  }),
};

const incomingEmailSchema = {
  body: z.object({
    subject: z.string().min(1),
    sender: z.string().min(1),
    body: z.string().min(1),
    isFaculty: z.boolean().optional(),
  }),
};

// Ingest/simulate incoming email
router.post("/incoming", validate(incomingEmailSchema), ingestIncomingEmail);

// Specific routes before param :id
router.get("/resolved", listResolvedThreads);
router.post("/resolved/:id/restore", restoreResolvedThread);

// Manual admin purge: deletes resolved threads older than 7 days immediately
router.post("/resolved/purge-expired", async (_req, res) => {
  await pruneOldResolvedThreads();
  res.json({ ok: true, message: "Purge complete — check server logs for count." });
});

router.get("/follow-up", getFollowUp);
router.get("/other", getOther);

// General thread routes
router.get("/", listThreads);
router.get("/:id", getThreadById);
router.patch("/:id/read", validate(markReadSchema), markRead);
router.patch("/:id/reclassify", validate(reclassifySchema), reclassify);
router.post("/:id/resolve", resolveThread);
router.patch("/:id/resolve", resolveThread);

export default router;


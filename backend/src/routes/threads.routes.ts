import { Router } from "express";
import { z } from "zod";
import {
  listThreads,
  getThreadById,
  markRead,
  reclassify,
  getFollowUp,
  getOther,
} from "../controllers/threads.controller.js";
import { validate } from "../middleware/validate.js";
import { THREAD_CATEGORIES } from "../models/Thread.js";

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

// Specific routes before param :id
router.get("/follow-up", getFollowUp);
router.get("/other", getOther);

// General thread routes
router.get("/", listThreads);
router.get("/:id", getThreadById);
router.patch("/:id/read", validate(markReadSchema), markRead);
router.patch("/:id/reclassify", validate(reclassifySchema), reclassify);

export default router;

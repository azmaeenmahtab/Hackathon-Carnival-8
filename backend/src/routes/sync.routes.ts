import { Router } from "express";
import { z } from "zod";
import { syncMock, syncGmail } from "../controllers/sync.controller.js";
import { syncRateLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const syncMockSchema = {
  body: z
    .object({
      reset: z.boolean().optional(),
    })
    .optional(),
};

router.post("/mock", syncRateLimiter, validate(syncMockSchema as any), syncMock);
router.post("/gmail", syncRateLimiter, syncGmail);

export default router;

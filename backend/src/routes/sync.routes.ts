import { Router } from "express";
import { z } from "zod";
import { syncMock } from "../controllers/sync.controller.js";
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

export default router;

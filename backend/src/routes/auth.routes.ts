import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/betterAuth.js";

const router = Router();

// Mount Better Auth handler for all /api/auth/* routes
router.all("/*", toNodeHandler(auth));

export default router;

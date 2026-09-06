import { Router } from "express";
import { getDigest } from "../controllers/digest.controller.js";

const router = Router();

router.get("/", getDigest);

export default router;

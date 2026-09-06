import { Request, Response, NextFunction } from "express";
import { digestService } from "../services/digestService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function getDigest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const digest = await digestService.getOrGenerateDigest(userId);
    return sendSuccess(res, digest);
  } catch (error) {
    next(error);
  }
}

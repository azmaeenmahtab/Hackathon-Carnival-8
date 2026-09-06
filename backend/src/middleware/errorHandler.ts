import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { sendError } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "ERROR");
  const message =
    env.NODE_ENV === "production" && statusCode === 500
      ? "An unexpected internal server error occurred"
      : err.message || "Internal server error";

  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        code: err.code,
      },
      method: req.method,
      url: req.originalUrl,
      userId: (req as any).user?.id,
    },
    "Request error handled"
  );

  return sendError(res, code, message, statusCode, err.details);
}

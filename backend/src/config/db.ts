import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    cachedPromise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
    });
    const conn = await cachedPromise;
    logger.info(
      `MongoDB connected to ${conn.connection.host}/${env.MONGODB_DB_NAME}`
    );
    return conn;
  } catch (error) {
    cachedPromise = null;
    logger.error({ err: error }, "Failed to connect to MongoDB");
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

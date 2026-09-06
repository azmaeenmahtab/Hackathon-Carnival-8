import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Catch-all route handler for Better Auth in Next.js App Router
 */
export const { GET, POST } = toNextJsHandler(auth.handler);

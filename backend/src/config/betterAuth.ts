import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins";
import mongoose from "mongoose";
import { env } from "./env.js";

// Lazy db proxy to defer collection calls until mongoose has connected
const lazyDb = new Proxy({} as any, {
  get(_target, prop) {
    const client = mongoose.connection.getClient();
    const db = client ? client.db(env.MONGODB_DB_NAME) : null;
    if (!db) {
      throw new Error("MongoDB is not connected yet.");
    }
    const val = (db as any)[prop];
    return typeof val === "function" ? val.bind(db) : val;
  },
});

const configuredOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim());

export const auth = betterAuth({
  database: mongodbAdapter(lazyDb),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    ...configuredOrigins,
    "https://*.vercel.app",
    "http://localhost:3000",
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
  plugins: [bearer()],
  emailAndPassword: {
    enabled: true,
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

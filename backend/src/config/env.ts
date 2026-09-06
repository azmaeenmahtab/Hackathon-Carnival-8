import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017"),
  MONGODB_DB_NAME: z.string().default("facultyinbox_dev"),

  BETTER_AUTH_SECRET: z.string().default("development_secret_key_at_least_32_characters_long_for_facultyinbox"),
  BETTER_AUTH_URL: z.string().default("http://localhost:5000"),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().default("http://localhost:3000"),

  LLM_PROVIDER: z.string().default("anthropic"),
  LLM_API_KEY: z.string().optional().default(""),
  LLM_MODEL: z.string().default("claude-3-5-sonnet-latest"),

  FOLLOWUP_THRESHOLD_HOURS: z.string().default("48").transform((val) => parseInt(val, 10)),
  DIGEST_CACHE_TTL_SECONDS: z.string().default("300").transform((val) => parseInt(val, 10)),
  MAX_MESSAGES_PER_THREAD: z.string().default("200").transform((val) => parseInt(val, 10)),

  TOKEN_ENCRYPTION_KEY: z.string().optional().default("development_token_encryption_key_32_bytes_len!"),
  GMAIL_CLIENT_ID: z.string().optional().default(""),
  GMAIL_CLIENT_SECRET: z.string().optional().default(""),
  GMAIL_REDIRECT_URI: z.string().optional().default(""),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;

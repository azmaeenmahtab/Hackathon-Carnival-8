import { betterAuth } from "better-auth";

/**
 * Better Auth server configuration
 * Implement your database adapter and providers here as needed.
 */
export const auth = betterAuth({
  // Add your database config (e.g. mongodb, prisma, drizzle)
  // database: ...
  emailAndPassword: {
    enabled: true,
  },
});

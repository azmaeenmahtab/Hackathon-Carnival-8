import { createAuthClient } from "better-auth/react";

/**
 * Better Auth React client helper
 * Used in client components to call signIn, signUp, useSession, signOut, etc.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

export const { signIn, signUp, useSession, signOut } = authClient;

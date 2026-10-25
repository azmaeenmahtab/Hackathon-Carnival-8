import { createAuthClient } from "better-auth/react";

/**
 * Better Auth React client helper
 * Used in client components to call signIn, signUp, useSession, signOut, etc.
 *
 * Configured with cross-origin credentials and Bearer token fallback for Vercel deployments.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  fetchOptions: {
    credentials: "include",
    onRequest(context) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("faculty_session_token");
        if (token) {
          if (context.headers && typeof (context.headers as any).set === "function") {
            (context.headers as any).set("Authorization", `Bearer ${token}`);
            (context.headers as any).set("x-session-token", token);
          } else if (context.headers) {
            (context.headers as any)["Authorization"] = `Bearer ${token}`;
            (context.headers as any)["x-session-token"] = token;
          }
        }
      }
    },
    onResponse(context) {
      if (typeof window !== "undefined") {
        let authToken: string | null = null;
        if (context.response?.headers && typeof (context.response.headers as any).get === "function") {
          authToken = (context.response.headers as any).get("set-auth-token");
        } else if (context.response?.headers) {
          authToken = (context.response.headers as any)["set-auth-token"] || null;
        }
        if (authToken) {
          localStorage.setItem("faculty_session_token", authToken);
        }
      }
    },
  },
});

export const { signIn, signUp, useSession, signOut } = authClient;

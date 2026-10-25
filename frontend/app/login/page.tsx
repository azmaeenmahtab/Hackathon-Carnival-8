"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy route redirect: forwards /login requests to the dedicated /auth/login portal.
 */
export default function OldLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <span className="h-6 w-6 rounded-full border-2 border-black border-t-transparent animate-spin" />
        <p className="text-xs font-semibold">Redirecting to secure login…</p>
      </div>
    </div>
  );
}

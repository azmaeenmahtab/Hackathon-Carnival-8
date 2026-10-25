"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useThreads } from "@/context/ThreadsContext";

export default function LoginPage() {
  const { setCurrentUser, showToast } = useThreads();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("faculty_session_token");
      const storedUser = localStorage.getItem("faculty_user");
      if (storedToken && storedUser) {
        window.location.href = "/";
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMessage(
          res.error.message || "Invalid credentials. Please verify your university email and password."
        );
      } else {
        showToast("Signed In", "Welcome back, Professor!", "success");

        const dataObj = res.data as any;
        const token = dataObj?.token || dataObj?.session?.token || (res as any)?.token;
        if (token && typeof window !== "undefined") {
          localStorage.setItem("faculty_session_token", token);
        }
        if (res.data?.user) {
          if (typeof window !== "undefined") {
            localStorage.setItem("faculty_user", JSON.stringify(res.data.user));
          }
          setCurrentUser({
            id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
            department: "Department of Computer Science",
          });
        }

        window.location.href = "/";
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected connection error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("dr.vance@university.edu");
    setPassword("Password123!");
    setErrorMessage(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 space-y-6">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          <span>Faculty Portal</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Faculty Sign In
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Enter your university credentials to access your priority triage queue and AI daily briefing.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-3 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            University Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="evance@university.edu"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-white/10 dark:focus:border-white"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <span className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-white/10 dark:focus:border-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black/20 dark:border-slate-700 dark:bg-slate-900"
          />
          <label htmlFor="remember-me" className="text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer">
            Remember this session on this device
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-black hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Authenticating Session…</span>
            </div>
          ) : (
            <>
              <span>Sign In to Inbox</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-black bg-slate-50 hover:bg-white text-slate-700 text-xs font-bold transition-all dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Fill Verified Demo Credentials</span>
        </button>

        {/* Navigation to Signup */}
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          New faculty member?{" "}
          <Link
            href="/auth/signup"
            className="font-bold text-slate-900 hover:underline dark:text-white"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

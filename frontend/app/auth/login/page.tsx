"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
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
        window.location.href = "/dashboard";
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations (avoids default browser validation alert tooltips)
    if (!email.trim()) {
      setErrorMessage("Please enter your university email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address (e.g. professor@university.edu).");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters in length.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
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

        window.location.href = "/dashboard";
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
    <div className="bg-white rounded-[28px] p-5 sm:p-8 shadow-sm border border-black/[0.06] space-y-6">
      {/* Title Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
          Faculty Sign In
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Enter your university email to access your priority triage queue and daily briefing.
        </p>
      </div>

      {/* Sign In Form with noValidate to suppress default browser alert tooltips */}
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {/* Form Error Banner at the top of the form */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            University Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="evance@university.edu"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Password
            </label>
            <span className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black cursor-pointer"
          />
          <label htmlFor="remember-me" className="text-xs text-slate-600 select-none cursor-pointer">
            Remember this session
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-black hover:bg-slate-850 shadow-xs transition-all disabled:opacity-60 cursor-pointer"
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
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-black bg-slate-50 hover:bg-white text-slate-800 text-xs font-bold transition-all cursor-pointer"
        >
          <KeyRound className="h-3.5 w-3.5 text-slate-700" />
          <span>Fill Verified Demo Credentials</span>
        </button>

        {/* Navigation to Signup */}
        <p className="text-xs text-center text-slate-500">
          New faculty member?{" "}
          <Link
            href="/auth/signup"
            className="font-bold text-slate-950 hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

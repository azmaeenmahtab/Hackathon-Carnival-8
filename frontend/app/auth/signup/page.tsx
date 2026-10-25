"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useThreads } from "@/context/ThreadsContext";

export default function SignUpPage() {
  const { setCurrentUser, showToast } = useThreads();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Department of Computer Science");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    if (!name.trim()) {
      setErrorMessage("Please enter your full faculty name.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter matching passwords.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (res.error) {
        setErrorMessage(
          res.error.message || "Failed to create faculty account. This email may already be registered."
        );
      } else {
        showToast("Account Created", "Welcome to FacultyInbox AI / MailMind!", "success");

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
            department: department.trim() || "Department of Computer Science",
          });
        }

        window.location.href = "/";
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 space-y-6">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          <span>New Faculty Onboarding</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Faculty Account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Register your university profile to automate academic email priority and response queues.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-3 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Faculty Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Eleanor Vance"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-white/10 dark:focus:border-white"
            />
          </div>
        </div>

        {/* Department / Division */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Department / Faculty Division
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department of Computer Science"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-white/10 dark:focus:border-white"
            />
          </div>
        </div>

        {/* University Email */}
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

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Password (min. 8 characters)
          </label>
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-white/10 dark:focus:border-white"
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">
              Passwords do not match.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-black hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all disabled:opacity-60 cursor-pointer pt-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Creating Faculty Account…</span>
            </div>
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Navigation to Sign In */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already have a faculty account?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-slate-900 hover:underline dark:text-white"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

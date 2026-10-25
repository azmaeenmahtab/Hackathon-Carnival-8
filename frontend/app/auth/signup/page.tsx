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
        window.location.href = "/dashboard";
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations (avoids default browser validation alert tooltips)
    if (!name.trim()) {
      setErrorMessage("Please enter your full faculty name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your university email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid university email address (e.g. professor@university.edu).");
      return;
    }

    if (!password) {
      setErrorMessage("Please create a password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters in length.");
      return;
    }

    if (!confirmPassword) {
      setErrorMessage("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter matching passwords.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
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

        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] p-7 sm:p-9 shadow-sm border border-black/[0.06] space-y-6">
      {/* Title Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
          Create Faculty Account
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Register your university profile to automate academic email priority triage.
        </p>
      </div>

      {/* Sign Up Form with noValidate to suppress default browser alert tooltips */}
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {/* Form Error Banner at the top of the form */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Faculty Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Dr. Eleanor Vance"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
            />
          </div>
        </div>

        {/* Department / Division */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Department / Faculty Division
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Department of Computer Science"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
            />
          </div>
        </div>

        {/* University Email */}
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

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Password (min. 8 characters)
          </label>
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-black hover:bg-slate-850 shadow-xs transition-all disabled:opacity-60 cursor-pointer pt-2"
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
      <div className="pt-2 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Already have a faculty account?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-slate-950 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

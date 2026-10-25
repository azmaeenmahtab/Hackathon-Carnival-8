"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "warning";
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:top-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:w-96 pointer-events-none mx-auto sm:mx-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-black/10 bg-white/95 backdrop-blur-md p-4 shadow-xl transition-all animate-in slide-in-from-top-3 duration-200"
        >
          {toast.type === "success" && (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          )}
          {toast.type === "warning" && (
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          )}
          {(!toast.type || toast.type === "info") && (
            <Info className="h-5 w-5 text-slate-800 mt-0.5 shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-950">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-700 rounded-lg p-1 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

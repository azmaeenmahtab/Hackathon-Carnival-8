import type { Metadata } from "next";
import "./globals.css";
import { ThreadsProvider } from "@/context/ThreadsContext";

export const metadata: Metadata = {
  title: "FacultyInbox AI — Intelligent University Email Triage",
  description:
    "Intelligent email triage dashboard for university faculty: prioritizing what matters, surfacing AI reasoning, and tracking unanswered threads.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-slate-100/70 text-slate-900">
        <ThreadsProvider>{children}</ThreadsProvider>
      </body>
    </html>
  );
}

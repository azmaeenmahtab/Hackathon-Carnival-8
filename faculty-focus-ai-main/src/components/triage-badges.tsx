import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  ClipboardList,
  FileSearch,
  GraduationCap,
  Inbox,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/format";
import type { Category, Urgency } from "@/lib/types";

const URGENCY_STYLES: Record<Urgency, string> = {
  Critical: "bg-critical-surface text-critical border-critical/25",
  High: "bg-high-surface text-high border-high/25",
  Medium: "bg-medium-surface text-medium border-medium/25",
  Low: "bg-low-surface text-low border-low/20",
};

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Meeting: Users,
  "Class/Schedule": CalendarClock,
  "Student Issue": GraduationCap,
  Examination: BookOpen,
  "Re-evaluation": FileSearch,
  "Committee/Admin": ClipboardList,
  Other: Inbox,
};

export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        URGENCY_STYLES[urgency],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {urgency}
    </span>
  );
}

export function CategoryBadge({
  category,
  corrected,
  className,
}: {
  category: Category;
  corrected?: boolean;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
        category === "Other" && "text-low/80",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {category}
      {corrected && <span className="text-[10px] text-primary">· edited</span>}
    </span>
  );
}

export function DeadlineChip({ deadline }: { deadline: string }) {
  const days = Math.ceil(
    (new Date(`${deadline}T23:59:59`).getTime() - Date.now()) / 86_400_000,
  );
  const soon = days <= 1;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        soon
          ? "border-critical/25 bg-critical-surface text-critical"
          : "border-border bg-surface-muted text-muted-foreground",
      )}
    >
      <CalendarClock className="size-3.5" aria-hidden />
      Due: {shortDate(deadline)}
      {days <= 0 ? " · today" : days === 1 ? " · tomorrow" : ""}
    </span>
  );
}

export function AiExplanation({
  text,
  variant = "inline",
  className,
}: {
  text: string;
  variant?: "inline" | "callout";
  className?: string;
}) {
  if (variant === "callout") {
    return (
      <div
        className={cn(
          "rounded-lg border border-ai/20 bg-ai-surface px-4 py-3",
          className,
        )}
      >
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ai uppercase">
          <Sparkles className="size-3.5" aria-hidden /> Why this matters
        </p>
        <p className="ai-note mt-1.5 text-sm">{text}</p>
      </div>
    );
  }
  return (
    <p
      className={cn(
        "ai-note flex items-start gap-1.5 rounded-md bg-ai-surface/70 px-2 py-1 text-sm",
        className,
      )}
    >
      <Sparkles className="mt-0.5 size-3.5 shrink-0 not-italic" aria-hidden />
      <span>{text}</span>
    </p>
  );
}

export function FollowUpFlag({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-high/30 bg-high-surface px-2 py-0.5 text-xs font-semibold text-high">
      <AlertTriangle className="size-3.5" aria-hidden />
      {label ?? "Needs follow-up"}
    </span>
  );
}

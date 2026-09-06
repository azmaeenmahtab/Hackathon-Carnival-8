import { Link } from "@tanstack/react-router";
import { AlertTriangle, Flame, Mail, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CATEGORY_ICONS } from "@/components/triage-badges";
import { useDailyDigest, useInbox } from "@/hooks/use-inbox";
import { FACULTY_USER } from "@/lib/mock-threads";
import { CATEGORIES, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DigestCard() {
  const lines = useDailyDigest();
  const firstName = FACULTY_USER.name.replace("Dr. ", "").split(" ")[0];

  return (
    <section className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-card lg:p-8">
      <div>
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            AI insights
          </span>
        </div>
        <h2 className="mt-3 font-serif text-2xl leading-tight font-bold lg:text-3xl">
          Good morning, Dr. {firstName}.
        </h2>
        <p className="ai-note mt-4 max-w-2xl text-[17px] not-italic">
          {lines.length ? lines.join(" ") : "Nothing needs your attention right now."}
        </p>
      </div>
      <p className="mt-6 flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" aria-hidden />
        Summarised from your triaged threads a few minutes ago.
      </p>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  to,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "critical" | "high" | "medium" | "low";
  to?: "/follow-up";
}) {
  const tones = {
    critical: "text-critical",
    high: "text-high",
    medium: "text-medium",
    low: "text-low",
  } as const;

  const body = (
    <div
      className={cn(
        "flex h-full items-center justify-between gap-3 rounded-2xl border border-border px-5 py-4 transition-shadow",
        tone === "critical" ? "bg-ai-surface/60" : "bg-surface",
        "shadow-card hover:shadow-lift",
      )}
    >
      <span className="flex items-center gap-2.5">
        <Icon className={cn("size-4", tones[tone])} aria-hidden />
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      </span>
      <span className="font-serif text-2xl leading-none font-bold text-primary tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
    </div>
  );

  return to ? (
    <Link to={to} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export function StatStrip() {
  const { stats } = useInbox();
  return (
    <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <StatCard label="Critical" value={stats.critical} icon={Flame} tone="critical" />
      <StatCard label="High" value={stats.high} icon={AlertTriangle} tone="high" />
      <StatCard
        label="Follow-up"
        value={stats.followUp}
        icon={AlertTriangle}
        tone="medium"
        to="/follow-up"
      />
      <StatCard label="Unread" value={stats.unread} icon={Mail} tone="low" />
    </div>
  );
}

export function CategoryFilter({
  active,
  onChange,
  counts,
}: {
  active: Category | "All";
  onChange: (value: Category | "All") => void;
  counts: Record<string, number>;
}) {
  const options: (Category | "All")[] = ["All", ...CATEGORIES];
  return (
    <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Filter by category">
      {options.map((option) => {
        const Icon = option === "All" ? Mail : CATEGORY_ICONS[option];
        const isActive = active === option;
        const isOther = option === "Other";
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-card"
                : "border-border bg-surface text-foreground hover:bg-accent/40",
              isOther && !isActive && "border-dashed text-muted-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {option}
            <span className="tabular-nums opacity-60">{counts[option] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

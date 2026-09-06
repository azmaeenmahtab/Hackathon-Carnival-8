import { Link } from "@tanstack/react-router";
import { AlertTriangle, Inbox, LayoutDashboard, ListFilter, Mails } from "lucide-react";
import type { ReactNode } from "react";

import { useInbox } from "@/hooks/use-inbox";
import { FACULTY_USER } from "@/lib/mock-threads";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/threads", label: "All threads", icon: Mails },
  { to: "/follow-up", label: "Needs follow-up", icon: AlertTriangle },
  { to: "/other", label: "Other / low priority", icon: Inbox, muted: true },
] as const;

function NavList({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const { stats } = useInbox();
  const counts: Record<string, number> = {
    "Needs follow-up": stats.followUp,
    "Other / low priority": stats.filteredOther,
  };

  return (
    <nav
      className={cn(
        "gap-1",
        orientation === "vertical" ? "flex flex-col" : "flex overflow-x-auto",
      )}
    >
      {NAV.map(({ to, label, icon: Icon, ...rest }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          activeProps={{
            className: "bg-accent text-accent-foreground font-semibold",
          }}
          inactiveProps={{
            className: cn(
              "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              "muted" in rest && rest.muted && "text-low/70",
            ),
          }}
          className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
        >
          <Icon className="size-4" aria-hidden />
          <span className="whitespace-nowrap">{label}</span>
          {counts[label] ? (
            <span className="ml-auto rounded-full bg-surface-muted px-1.5 py-0.5 text-[11px] tabular-nums">
              {counts[label]}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

function UserBadge() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="hidden text-right sm:block">
        <p className="text-sm leading-tight font-medium">{FACULTY_USER.name}</p>
        <p className="text-[11px] text-muted-foreground">{FACULTY_USER.role}</p>
      </div>
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {initials(FACULTY_USER.name.replace("Dr. ", ""))}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface px-4 py-6 lg:block">
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ListFilter className="size-4.5" aria-hidden />
          </span>
          <span>
            <span className="block font-serif text-base leading-tight font-semibold">
              FacultyInbox AI
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Email triage for faculty
            </span>
          </span>
        </Link>
        <div className="mt-7">
          <NavList orientation="vertical" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-3 lg:px-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ListFilter className="size-4" aria-hidden />
              </span>
              <span className="font-serif text-sm font-semibold">FacultyInbox AI</span>
            </Link>
            <p className="hidden text-sm text-muted-foreground lg:block">
              Triaged inbox · updated a few minutes ago
            </p>
            <UserBadge />
          </div>
          <div className="border-t border-border px-3 py-2 lg:hidden">
            <NavList orientation="horizontal" />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeading({
  title,
  description,
  tone = "default",
}: {
  title: string;
  description: string;
  tone?: "default" | "attention";
}) {
  return (
    <div
      className={cn(
        "mb-5",
        tone === "attention" && "border-l-[3px] border-l-high pl-4",
      )}
    >
      <h1 className="font-serif text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

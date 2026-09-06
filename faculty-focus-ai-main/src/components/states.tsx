import { CheckCircle2, Inbox, RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DigestSkeleton() {
  return (
    <div className="rounded-xl border border-ai/20 bg-ai-surface/60 p-5">
      <Skeleton className="h-4 w-40" />
      <div className="mt-4 space-y-2.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-9/12" />
      </div>
    </div>
  );
}

export function ThreadListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="mt-3 h-3 w-1/3" />
          <Skeleton className="mt-3 h-8 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  tone = "neutral",
}: {
  title: string;
  description: string;
  tone?: "neutral" | "positive";
}) {
  const Icon = tone === "positive" ? CheckCircle2 : Inbox;
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
      <Icon
        className={
          tone === "positive"
            ? "mx-auto size-7 text-primary"
            : "mx-auto size-7 text-muted-foreground"
        }
        aria-hidden
      />
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({
  message = "We couldn't load your inbox.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-6 py-10 text-center">
      <TriangleAlert className="mx-auto size-7 text-high" aria-hidden />
      <h3 className="mt-3 text-base font-semibold">{message}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Your mail service may be temporarily unavailable. Nothing has been lost.
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      )}
    </div>
  );
}

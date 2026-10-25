"use client";

import React from "react";
import { DailyDigestCard } from "@/components/DailyDigestCard";
import { PriorityStatStrip } from "@/components/PriorityStatStrip";
import { CategoryFilterTabs } from "@/components/CategoryFilterTabs";
import { ThreadList } from "@/components/ThreadList";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DailyDigestCard />
      <PriorityStatStrip />
      <CategoryFilterTabs />
      <ThreadList />
    </div>
  );
}

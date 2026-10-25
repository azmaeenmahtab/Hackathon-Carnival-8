"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PriorityFilteredView } from "@/components/PriorityFilteredView";

export default function PriorityPage() {
  const params = useParams();
  const raw = (params?.urgency as string) || "critical";

  const map: Record<string, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  const urgency = map[raw.toLowerCase()] || "Critical";

  return <PriorityFilteredView urgency={urgency} />;
}

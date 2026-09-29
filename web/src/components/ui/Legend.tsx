"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LegendItem {
  label: string;
  color: string;
  patternClass?: string;
  dashed?: boolean;
}

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 font-mono text-xs", className)}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-1.5">
          <span
            className={cn("h-3 w-3 rounded-sm border border-[var(--border)]", item.patternClass)}
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[var(--text-2)] text-[11px]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

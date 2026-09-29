"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded border border-[var(--border-strong)] bg-[var(--surface-3)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-2)] shadow-sm",
        className
      )}
    >
      {children}
    </kbd>
  );
}

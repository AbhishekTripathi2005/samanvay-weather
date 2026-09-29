"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "card" | "metric" | "table-row";
  className?: string;
}

export function Skeleton({ variant = "text", className, ...props }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circle: "h-10 w-10 rounded-full",
    card: "h-32 w-full rounded-xl",
    metric: "h-24 w-full rounded-xl",
    "table-row": "h-10 w-full rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--surface-3)]/60 border border-[var(--border)]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 1 | 2 | 3;
  hoverLift?: boolean;
  glow?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  elevation = 2,
  hoverLift = false,
  glow = false,
  className,
  ...props
}: GlassCardProps) {
  const bgClasses = {
    1: "bg-[var(--surface-1)]",
    2: "bg-[var(--surface-2)]",
    3: "bg-[var(--surface-3)]",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] backdrop-blur-md transition-all duration-200",
        bgClasses[elevation],
        glow && "shadow-[var(--glow)]",
        hoverLift && "hover:-translate-y-1 hover:shadow-lg hover:border-[var(--border-strong)]",
        className
      )}
      style={{ boxShadow: "var(--glow-inner)" }}
      {...props}
    >
      {children}
    </div>
  );
}

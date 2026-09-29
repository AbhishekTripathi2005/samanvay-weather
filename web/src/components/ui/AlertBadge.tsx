"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertTier = "GREEN" | "YELLOW" | "ORANGE" | "RED";

interface AlertBadgeProps {
  tier: AlertTier;
  text?: string;
  showPattern?: boolean;
  className?: string;
}

export function AlertBadge({
  tier,
  text,
  showPattern = true,
  className,
}: AlertBadgeProps) {
  const configs = {
    GREEN: {
      color: "var(--alert-green)",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/40",
      textColor: "text-emerald-400",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      defaultText: "NORMAL",
      patternClass: "",
    },
    YELLOW: {
      color: "var(--alert-yellow)",
      bg: "bg-yellow-500/15",
      border: "border-yellow-500/40",
      textColor: "text-yellow-400",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      defaultText: "WATCH (>64.5mm)",
      patternClass: "pattern-dots",
    },
    ORANGE: {
      color: "var(--alert-orange)",
      bg: "bg-amber-500/15",
      border: "border-amber-500/40",
      textColor: "text-amber-400",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      defaultText: "ALERT (>115.6mm)",
      patternClass: "pattern-stripes",
    },
    RED: {
      color: "var(--alert-red)",
      bg: "bg-red-500/15",
      border: "border-red-500/40",
      textColor: "text-red-400",
      icon: <AlertOctagon className="h-3.5 w-3.5" />,
      defaultText: "WARNING (>204.5mm)",
      patternClass: "pattern-cross",
    },
  };

  const c = configs[tier];

  return (
    <span
      className={cn(
        "relative inline-flex items-center space-x-1.5 rounded-md border px-2.5 py-1 text-xs font-mono font-bold uppercase overflow-hidden",
        c.bg,
        c.border,
        c.textColor,
        className
      )}
    >
      {/* Pattern texture overlay for colorblind accessible differentiation */}
      {showPattern && c.patternClass && (
        <span
          className={cn("absolute inset-0 opacity-15 pointer-events-none", c.patternClass)}
          style={{ color: c.color }}
        />
      )}
      <span className="relative z-10 flex items-center space-x-1">
        {c.icon}
        <span>{text || c.defaultText}</span>
      </span>
    </span>
  );
}

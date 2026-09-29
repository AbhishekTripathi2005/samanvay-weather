"use client";

import React from "react";
import { Radio, AlertCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard
      elevation={1}
      className={cn("flex flex-col items-center justify-center p-8 text-center", className)}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--accent-cyan)] shadow-[var(--glow)] mb-3">
        <Radio className="h-6 w-6 animate-pulse" />
      </div>
      <h4 className="font-heading font-bold text-sm text-[var(--text-1)]">{title}</h4>
      <p className="text-xs text-[var(--text-3)] max-w-sm mt-1">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)]/40 px-3 py-1.5 font-mono text-xs font-bold text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30 transition"
        >
          {actionText}
        </button>
      )}
    </GlassCard>
  );
}

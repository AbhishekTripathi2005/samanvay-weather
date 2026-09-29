"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "relative flex items-center rounded-lg bg-[var(--surface-1)] p-1 border border-[var(--border)]",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative z-10 flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium font-mono rounded-md transition-colors",
              isSelected
                ? "text-[var(--text-1)] font-bold"
                : "text-[var(--text-3)] hover:text-[var(--text-2)]"
            )}
          >
            {opt.icon && <span className="h-3.5 w-3.5">{opt.icon}</span>}
            <span>{opt.label}</span>

            {isSelected && (
              <motion.div
                layoutId="segmented-active"
                className="absolute inset-0 -z-10 rounded-md bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

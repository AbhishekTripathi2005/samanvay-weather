"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: "right" | "bottom";
  side?: "right" | "bottom";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  side,
}: DrawerProps) {
  const pos = side || position;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div
        className={cn(
          "relative z-10 flex flex-col bg-[var(--surface-1)] border border-[var(--border)] shadow-2xl p-5 backdrop-blur-xl font-mono text-xs",
          pos === "right" && "ml-auto h-full w-full max-w-md animate-in slide-in-from-right",
          pos === "bottom" && "mt-auto w-full max-h-[80vh] rounded-t-2xl animate-in slide-in-from-bottom"
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
          <h3 className="font-heading text-sm font-bold text-[var(--text-1)]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--text-3)] hover:text-[var(--text-1)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

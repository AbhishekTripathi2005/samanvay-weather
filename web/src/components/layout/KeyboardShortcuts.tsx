"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Dialog } from "@/components/ui/Dialog";
import { Kbd } from "@/components/ui/Kbd";
import { NAVIGATION_ROUTES } from "./Sidebar";

export function KeyboardShortcuts() {
  const router = useRouter();
  const {
    isShortcutsOpen,
    setIsShortcutsOpen,
    stepLead,
    toggleTheme
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is focused inside input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // 0: return to landing showcase
      if (e.key === "0") {
        e.preventDefault();
        router.push("/");
        return;
      }

      // 1-9 direct page jump
      if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key, 10) - 1;
        if (index < NAVIGATION_ROUTES.length) {
          e.preventDefault();
          router.push(NAVIGATION_ROUTES[index].path);
        }
        return;
      }

      // [ / ] step lead time
      if (e.key === "[") {
        e.preventDefault();
        stepLead(-1);
        return;
      }
      if (e.key === "]") {
        e.preventDefault();
        stepLead(1);
        return;
      }

      // T / t: toggle theme
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // ?: open shortcuts modal
      if (e.key === "?") {
        e.preventDefault();
        setIsShortcutsOpen(!isShortcutsOpen);
        return;
      }

      // /: focus quick search
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, stepLead, toggleTheme, isShortcutsOpen, setIsShortcutsOpen]);

  return (
    <Dialog
      isOpen={isShortcutsOpen}
      onClose={() => setIsShortcutsOpen(false)}
      title="SAMANVAY Keyboard Shortcuts"
      className="max-w-md"
    >
      <div className="flex flex-col gap-3 py-1 text-xs">
        <p className="text-text-3">Operational navigation shortcuts for rapid command response:</p>

        <div className="flex flex-col gap-2 border border-border/50 rounded-xl p-3 bg-surface-2/40">
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-text-1">Switch to pages 1–9</span>
            <div className="flex gap-1">
              <Kbd>1</Kbd>
              <span className="text-text-3">-</span>
              <Kbd>9</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-text-1">Step lead time backward</span>
            <Kbd>[</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-text-1">Step lead time forward</span>
            <Kbd>]</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-text-1">Toggle dark / light theme</span>
            <Kbd>T</Kbd>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-text-1">Focus search bar</span>
            <Kbd>/</Kbd>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-text-1">Show this shortcuts modal</span>
            <Kbd>?</Kbd>
          </div>
        </div>

        <div className="text-[11px] text-text-3 flex justify-between px-1">
          <span>Press <Kbd>ESC</Kbd> to close</span>
          <span className="text-cyan-400">SAMANVAY Operational Command</span>
        </div>
      </div>
    </Dialog>
  );
}

"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { RunBlendModal } from "./RunBlendModal";
import { NotificationCenter } from "./NotificationCenter";
import { CommandPalette } from "./CommandPalette";
import { ProductTour } from "./ProductTour";
import { DemoMode } from "./DemoMode";
import { UrlSync } from "./UrlSync";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-surface-0 text-text-1">
        <React.Suspense fallback={null}>
          <UrlSync />
        </React.Suspense>
        <KeyboardShortcuts />
        <RunBlendModal />
        <NotificationCenter />
        <CommandPalette />
        <ProductTour />
        <DemoMode />
        <Toaster position="top-right" richColors />
        <main className="w-full min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 text-text-1">
      <React.Suspense fallback={null}>
        <UrlSync />
      </React.Suspense>
      <KeyboardShortcuts />
      <RunBlendModal />
      <NotificationCenter />
      <CommandPalette />
      <ProductTour />
      <DemoMode />
      <Toaster position="top-right" richColors />

      {/* Desktop Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
}

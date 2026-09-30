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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-black focus:font-semibold focus:rounded-lg focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300"
        >
          Skip to main content
        </a>
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
        <main id="main-content" className="w-full min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 text-text-1">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-black focus:font-semibold focus:rounded-lg focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300"
      >
        Skip to main content
      </a>
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
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
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

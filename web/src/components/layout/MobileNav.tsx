"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, AlertTriangle, Mountain, MoreHorizontal, X, Sun, Moon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { NAVIGATION_ROUTES } from "./Sidebar";
import { Drawer } from "@/components/ui/Drawer";

export function MobileNav() {
  const pathname = usePathname();
  const { isMobileNavOpen, setIsMobileNavOpen, theme, toggleTheme } = useAppStore();

  const primaryTabs = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/forecast", label: "Forecast", icon: Map },
    { path: "/extremes", label: "Alerts", icon: AlertTriangle },
    { path: "/impact", label: "Impact", icon: Mountain }
  ];

  return (
    <>
      {/* Fixed Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-1/95 backdrop-blur-xl border-t border-border/80 flex items-center justify-around px-2 z-40 select-none">
        {primaryTabs.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg text-[10px] transition-colors ${
                isActive ? "text-cyan-400 font-bold" : "text-text-3 hover:text-text-1"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="flex flex-col items-center justify-center w-14 h-12 rounded-lg text-[10px] text-text-3 hover:text-text-1"
          aria-label="More navigation options"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-over Mobile Sheet Drawer */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        title="SAMANVAY Command Center"
        side="bottom"
      >
        <div className="flex flex-col gap-2 py-2">
          {NAVIGATION_ROUTES.map((route) => {
            const isActive = pathname === route.path;
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                href={route.path}
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-text-2 hover:bg-surface-2"
                }`}
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                <div className="flex flex-col">
                  <span>{route.label}</span>
                  <span className="text-[11px] text-text-3">{route.desc}</span>
                </div>
              </Link>
            );
          })}

          <div className="border-t border-border/50 pt-3 mt-2 flex items-center justify-between">
            <span className="text-xs text-text-2">Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs flex items-center gap-2 text-text-1"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

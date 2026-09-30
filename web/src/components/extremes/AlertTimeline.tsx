"use client";

import React from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import type { ExtremesTimelineResponse, AlertLevel } from "@/lib/types";

const LEVEL_CONFIG: Record<AlertLevel, { bg: string; border: string; text: string; label: string }> = {
  GREEN:  { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400", label: "N" },
  YELLOW: { bg: "bg-yellow-500/20",  border: "border-yellow-500/40",  text: "text-yellow-400",  label: "W" },
  ORANGE: { bg: "bg-amber-500/20",   border: "border-amber-500/40",   text: "text-amber-400",   label: "A" },
  RED:    { bg: "bg-red-500/20",     border: "border-red-500/40",     text: "text-red-400",     label: "W!" },
};

interface AlertTimelineProps {
  timeline: ExtremesTimelineResponse | null;
  isLoading?: boolean;
  districtName?: string;
}

export function AlertTimeline({ timeline, isLoading, districtName }: AlertTimelineProps) {
  function handleSubscribe() {
    toast.success(`Subscribed to ${districtName ?? "district"} alerts`, {
      description: "You will receive push notifications for new and escalating warnings.",
      duration: 4000,
    });
  }

  return (
    <GlassCard className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-1">
            10-Day Alert Timeline
            {districtName && <span className="ml-1.5 text-text-3 font-normal">— {districtName}</span>}
          </h3>
          <p className="text-[10px] text-text-3 mt-0.5">
            Blended probability forecast · Days 1–10 from today
          </p>
        </div>
        <button
          onClick={handleSubscribe}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
          aria-label={`Subscribe to alerts for ${districtName}`}
        >
          <Bell className="h-3.5 w-3.5" />
          Subscribe
        </button>
      </div>

      {isLoading && (
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 h-16 rounded-lg bg-surface-2/40 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !timeline && (
        <div className="py-6 text-center text-text-3 text-xs">
          Select a district to view its 10-day alert timeline.
        </div>
      )}

      {!isLoading && timeline && (
        <>
          {/* Day strips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {timeline.days.map((day) => {
              const cfg = LEVEL_CONFIG[day.alert_level as AlertLevel] ?? LEVEL_CONFIG.GREEN;
              const barH = Math.max(8, Math.round(day.p_extreme * 100));
              return (
                <div
                  key={day.day}
                  className={cn(
                    "flex-1 min-w-[48px] flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-default",
                    cfg.bg, cfg.border
                  )}
                  role="cell"
                  aria-label={`Day ${day.day} (${day.date_label}): ${day.alert_level} — P=${Math.round(day.p_extreme * 100)}%`}
                >
                  {/* Date label */}
                  <span className="text-[9px] text-text-3 font-mono leading-tight">{day.date_label}</span>
                  <span className="text-[8px] text-text-3 font-mono">D{day.day}</span>

                  {/* Probability bar */}
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div className="w-full bg-surface-2/50 rounded-full overflow-hidden" style={{ height: 32 }}>
                      <div
                        className="w-full rounded-full transition-all duration-500"
                        style={{
                          height: `${barH}%`,
                          marginTop: `${100 - barH}%`,
                          backgroundColor:
                            day.alert_level === "RED"    ? "#ef4444" :
                            day.alert_level === "ORANGE" ? "#f59e0b" :
                            day.alert_level === "YELLOW" ? "#eab308" : "#10b981",
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <span className={cn("text-[9px] font-mono font-bold", cfg.text)}>
                      {Math.round(day.p_extreme * 100)}%
                    </span>
                  </div>

                  {/* Alert tier label */}
                  <span className={cn("text-[8px] font-bold font-mono", cfg.text)}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-3 flex-wrap text-[9px] text-text-3">
            <span className="font-semibold">Legend:</span>
            {(["GREEN","YELLOW","ORANGE","RED"] as AlertLevel[]).map((lv) => {
              const c = LEVEL_CONFIG[lv];
              return (
                <span key={lv} className={cn("px-1.5 py-0.5 rounded border font-mono font-bold", c.bg, c.border, c.text)}>
                  {lv}={c.label}
                </span>
              );
            })}
          </div>
        </>
      )}
    </GlassCard>
  );
}

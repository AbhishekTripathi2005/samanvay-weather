"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { useExtremesQuery } from "@/lib/queries";
import { Drawer } from "@/components/ui/Drawer";
import { AlertBadge } from "@/components/ui/AlertBadge";

export function AlertsDrawer() {
  const { isAlertsOpen, setIsAlertsOpen } = useAppStore();
  const { data: extremesData } = useExtremesQuery();
  const alerts = extremesData?.alerts || [];

  return (
    <Drawer
      isOpen={isAlertsOpen}
      onClose={() => setIsAlertsOpen(false)}
      title="Severe Weather Operational Advisories"
      side="right"
    >
      <div className="flex flex-col gap-3 py-2 text-xs">
        <div className="flex items-center justify-between text-text-3 pb-2 border-b border-border/50">
          <span>Active Alerts: {alerts.length}</span>
          <span className="font-mono text-rose-400 font-bold">
            {extremesData?.red_count || 0} RED / {extremesData?.orange_count || 0} ORANGE
          </span>
        </div>

        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-xl bg-surface-2 border border-border/60 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-1 text-sm">
                  {alert.district}, {alert.state}
                </span>
                <AlertBadge level={alert.alert_level} />
              </div>
              <div className="flex items-baseline justify-between text-xs text-text-2">
                <span>Forecast:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {alert.forecast_value} mm (p={Math.round(alert.p_extreme * 100)}%)
                </span>
              </div>
              <p className="text-[11px] text-text-3 leading-relaxed mt-0.5">
                {alert.recommended_action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

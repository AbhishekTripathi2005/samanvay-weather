"use client";

import React, { useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  useExtremesByVariableQuery,
  useExtremesTimelineQuery,
  useExtremesRocQuery,
  useExtremesPerfQuery,
  useExtremesEventsQuery,
  useExtremesExplainV2Query,
} from "@/lib/queries";
import { ExtremesTabs }             from "@/components/extremes/ExtremesTabs";
import { DistrictWarningTable }     from "@/components/extremes/DistrictWarningTable";
import { AlertDrawer }              from "@/components/extremes/AlertDrawer";
import { ExtremesVerificationPanel } from "@/components/extremes/ExtremesVerificationPanel";
import { AlertTimeline }            from "@/components/extremes/AlertTimeline";
import type { ExtremeAlertItem }    from "@/lib/types";

type TabVar = "rainfall" | "tmax" | "wind_gust";

const VAR_THRESHOLD: Record<TabVar, number> = {
  rainfall:  64.5,
  tmax:      44.0,
  wind_gust: 75.0,
};

export default function ExtremesPage() {
  const { variable: globalVariable } = useAppStore();
  const [activeVar, setActiveVar] = useState<TabVar>("rainfall");
  const [selectedAlert, setSelectedAlert] = useState<ExtremeAlertItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const threshold = VAR_THRESHOLD[activeVar];

  // Data queries
  const { data: extremes, isLoading: extremesLoading } = useExtremesByVariableQuery(activeVar);
  const { data: timeline, isLoading: timelineLoading } = useExtremesTimelineQuery(
    selectedAlert?.id ?? "",
    !!selectedAlert
  );
  const { data: explain, isLoading: explainLoading } = useExtremesExplainV2Query(
    selectedAlert?.id ?? "",
    !!selectedAlert
  );
  const { data: rocData,    isLoading: rocLoading }    = useExtremesRocQuery(activeVar, threshold);
  const { data: perfData,   isLoading: perfLoading }   = useExtremesPerfQuery(activeVar);
  const { data: eventsData, isLoading: eventsLoading } = useExtremesEventsQuery(activeVar, threshold);

  const alerts = extremes?.alerts ?? [];

  const handleDistrictSelect = useCallback((alert: ExtremeAlertItem) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleVariableChange = useCallback((v: TabVar) => {
    setActiveVar(v);
    setSelectedAlert(null);
    setDrawerOpen(false);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1 tracking-tight">
            Extreme Weather Guidance
          </h1>
          <p className="text-xs text-text-3 mt-1 max-w-xl">
            IMD four-tier alert matrix (Green / Yellow / Orange / Red) with calibrated exceedance
            probabilities, district-level advisories, and SOP protocols · MoES / NCMRWF PS 26081
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {extremes && (
            <>
              <span className="text-[11px] font-mono px-2 py-1 rounded border bg-red-500/15 border-red-500/40 text-red-400 font-bold">
                {extremes.red_count} RED
              </span>
              <span className="text-[11px] font-mono px-2 py-1 rounded border bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold">
                {extremes.orange_count} ORANGE
              </span>
              <span className="text-[11px] font-mono px-2 py-1 rounded border bg-yellow-500/15 border-yellow-500/40 text-yellow-400 font-bold">
                {extremes.yellow_count} YELLOW
              </span>
            </>
          )}
        </div>
      </div>

      {/* 1. Variable tabs + probability map */}
      <ExtremesTabs
        activeVariable={activeVar}
        onVariableChange={handleVariableChange}
      />

      {/* 2. District warning table */}
      <DistrictWarningTable
        alerts={alerts}
        isLoading={extremesLoading}
        onDistrictSelect={handleDistrictSelect}
        selectedId={selectedAlert?.id}
      />

      {/* 3. Alert timeline for selected district */}
      <AlertTimeline
        timeline={timeline ?? null}
        isLoading={timelineLoading && !!selectedAlert}
        districtName={selectedAlert ? `${selectedAlert.district}, ${selectedAlert.state}` : undefined}
      />

      {/* 4. Verification panel */}
      <ExtremesVerificationPanel
        rocData={rocData ?? null}
        rocLoading={rocLoading}
        perfData={perfData ?? null}
        perfLoading={perfLoading}
        eventsData={eventsData ?? null}
        eventsLoading={eventsLoading}
        variable={activeVar}
        threshold={threshold}
      />

      {/* 5. Alert Drawer (portal-style fixed overlay) */}
      <AlertDrawer
        alert={selectedAlert}
        explain={explain ?? null}
        timeline={timeline ?? null}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
}

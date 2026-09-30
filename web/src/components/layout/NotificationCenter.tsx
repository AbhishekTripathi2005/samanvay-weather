"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  AlertTriangle,
  History,
  CheckCircle2,
  Cpu,
  Clock,
  ExternalLink,
  ShieldAlert,
  Check
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useExtremesQuery } from "@/lib/queries";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { toast } from "sonner";

interface HistoricalAlert {
  id: string;
  district: string;
  state: string;
  variable: string;
  observed: string;
  forecast: string;
  outcome: "HIT" | "MISS" | "FALSE_ALARM";
  date: string;
}

const HISTORICAL_ALERTS: HistoricalAlert[] = [
  {
    id: "h1",
    district: "Wayanad",
    state: "Kerala",
    variable: "Rainfall",
    forecast: "88.0 mm",
    observed: "94.2 mm",
    outcome: "HIT",
    date: "Yesterday, 08:30 IST"
  },
  {
    id: "h2",
    district: "Shimla",
    state: "Himachal Pradesh",
    variable: "Rainfall",
    forecast: "92.4 mm",
    observed: "86.0 mm",
    outcome: "HIT",
    date: "2 days ago, 08:30 IST"
  },
  {
    id: "h3",
    district: "Mumbai City",
    state: "Maharashtra",
    variable: "Rainfall",
    forecast: "72.0 mm",
    observed: "48.5 mm",
    outcome: "FALSE_ALARM",
    date: "3 days ago, 08:30 IST"
  },
  {
    id: "h4",
    district: "Chamoli",
    state: "Uttarakhand",
    variable: "Rainfall",
    forecast: "42.0 mm",
    observed: "76.0 mm",
    outcome: "MISS",
    date: "4 days ago, 08:30 IST"
  }
];

const SYSTEM_NOTICES = [
  {
    id: "s1",
    title: "Operational Run Completed",
    body: "7 forecast streams synthesized. Consensus products written to edge cache in 392ms.",
    timestamp: "8 minutes ago",
    status: "SUCCESS"
  },
  {
    id: "s2",
    title: "Automated Synoptic Regime Shift",
    body: "Circulation mode transitioned to 'Active Monsoon Trough' over Central and Peninsular India.",
    timestamp: "32 minutes ago",
    status: "INFO"
  },
  {
    id: "s3",
    title: "ECMWF Open Data Ingestion",
    body: "Successfully pulled 0.1° IFS 00Z global forecast cycle (10 lead steps).",
    timestamp: "1 hour ago",
    status: "SUCCESS"
  }
];

export function NotificationCenter() {
  const router = useRouter();
  const { isAlertsOpen, setIsAlertsOpen, setRegion } = useAppStore();
  const { data: extremesData } = useExtremesQuery();
  const [activeTab, setActiveTab] = useState<"active" | "history" | "system">("active");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => extremesData?.alerts || [], [extremesData?.alerts]);

  const filteredAlerts = useMemo(() => {
    if (levelFilter === "ALL") return alerts;
    return alerts.filter((a) => a.alert_level === levelFilter);
  }, [alerts, levelFilter]);

  const handleMarkAllRead = () => {
    const all = new Set(alerts.map((a) => a.id));
    setReadIds(all);
    toast.success("All notifications marked as read");
  };

  const handleAlertClick = (alert: (typeof alerts)[0]) => {
    setReadIds((prev) => new Set(prev).add(alert.id));
    setIsAlertsOpen(false);
    router.push(`/extremes?district=${encodeURIComponent(alert.id)}`);
  };

  if (!isAlertsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-surface-1 border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-text-1">Notification Centre</h2>
              <p className="text-[11px] text-text-3">Active Advisories &amp; Verification Audit</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] font-semibold text-text-3 hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-surface-2"
              title="Mark all as read"
            >
              Mark all read
            </button>
            <button
              onClick={() => setIsAlertsOpen(false)}
              className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 py-2 border-b border-border/50 bg-surface-1 flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "active"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-text-3 hover:text-text-2 hover:bg-surface-2"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active ({alerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "history"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-text-3 hover:text-text-2 hover:bg-surface-2"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({HISTORICAL_ALERTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "system"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-text-3 hover:text-text-2 hover:bg-surface-2"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>System</span>
          </button>
        </div>

        {/* Level Filters for Active Tab */}
        {activeTab === "active" && (
          <div className="px-4 py-2 border-b border-border/40 bg-surface-2/20 flex items-center gap-1.5 text-[11px]">
            <span className="text-text-3 mr-1">Severity:</span>
            {["ALL", "RED", "ORANGE", "YELLOW"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2 py-0.5 rounded font-mono font-bold transition-all ${
                  levelFilter === lvl
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                    : "bg-surface-2 text-text-3 hover:text-text-2"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {/* Active Advisories */}
          {activeTab === "active" && (
            filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-3 italic">
                No active severe weather advisories for this filter.
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isRead = readIds.has(alert.id);
                return (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col gap-2 ${
                      isRead
                        ? "bg-surface-2/40 border-border/40 opacity-75"
                        : "bg-surface-2/80 border-border/80 hover:border-cyan-500/50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-text-1 text-sm">
                          {alert.district}, {alert.state}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        )}
                      </div>
                      <AlertBadge level={alert.alert_level} />
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono text-text-2">
                      <span>Forecast Exceedance:</span>
                      <span className="text-cyan-400 font-bold">
                        {alert.forecast_value} mm (P={Math.round(alert.p_extreme * 100)}%)
                      </span>
                    </div>

                    <p className="text-[11px] text-text-3 leading-relaxed">
                      {alert.recommended_action}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-text-3 border-t border-border/30 pt-2 font-mono">
                      <span>Lead: Day {alert.alert_day}</span>
                      <span className="text-cyan-400 flex items-center gap-1">
                        View DSS Guidance <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* Alert History Tab */}
          {activeTab === "history" && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-text-3">
                Verified historical alert performance from the preceding 7 days:
              </div>
              {HISTORICAL_ALERTS.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col gap-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-1">{h.district}, {h.state}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      h.outcome === "HIT" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                      h.outcome === "MISS" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                      "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {h.outcome}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-text-3 bg-surface-1/60 p-2 rounded-lg">
                    <div>
                      Forecast: <span className="text-cyan-300 font-bold">{h.forecast}</span>
                    </div>
                    <div>
                      Observed: <span className="text-emerald-300 font-bold">{h.observed}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-text-3 font-mono">
                    Verified: {h.date}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System Notices Tab */}
          {activeTab === "system" && (
            <div className="space-y-2.5">
              {SYSTEM_NOTICES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setIsAlertsOpen(false);
                    router.push("/ops");
                  }}
                  className="p-3.5 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col gap-1.5 text-xs hover:border-cyan-500/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-1">{s.title}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">{s.status}</span>
                  </div>
                  <p className="text-[11px] text-text-3 leading-relaxed">{s.body}</p>
                  <div className="text-[10px] text-text-3 font-mono flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{s.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-2/30 flex items-center justify-between text-xs">
          <span className="text-[11px] text-text-3 font-mono">
            IMD / MoES Operational Feed
          </span>
          <button
            onClick={() => {
              setIsAlertsOpen(false);
              router.push("/extremes");
            }}
            className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <span>Extreme Weather Desk</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

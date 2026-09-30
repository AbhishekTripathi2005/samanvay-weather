"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Clock, CheckCircle2, AlertCircle, Save, Globe } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";

interface Preset {
  label: string;
  cron: string;
  description: string;
}

const PRESETS: Preset[] = [
  {
    label: "Every 6 Hours (00Z, 06Z, 12Z, 18Z)",
    cron: "0 0,6,12,18 * * *",
    description: "Aligns with global NWP cycle dispatches (ECMWF, NCUM, IMD-GFS)."
  },
  {
    label: "Daily at 03:00 IST (21:30 UTC)",
    cron: "30 21 * * *",
    description: "Prepares morning operational bulletin prior to 06:00 IST shift briefing."
  },
  {
    label: "Every 3 Hours (Rapid Synoptic Cycle)",
    cron: "0 */3 * * *",
    description: "Fast AI inference cycle updates during Active Monsoon troughing."
  },
  {
    label: "Every Hour",
    cron: "0 * * * *",
    description: "High-frequency nowcasting and radar ingestion cycle."
  }
];

export function SchedulerConfig() {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESETS[0].label);
  const [cronExpression, setCronExpression] = useState<string>(PRESETS[0].cron);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPreset = (p: Preset) => {
    setSelectedPreset(p.label);
    setCronExpression(p.cron);
  };

  // Validation
  const isValidCron = useMemo(() => {
    const parts = cronExpression.trim().split(/\s+/);
    return parts.length === 5;
  }, [cronExpression]);

  // Human-readable translation
  const humanReadable = useMemo(() => {
    const parts = cronExpression.trim().split(/\s+/);
    if (parts.length !== 5) return "Invalid cron format (must have 5 fields)";

    const [min, hour, dom, mon, dow] = parts;

    if (cronExpression === "0 0,6,12,18 * * *") {
      return "Every 6 hours at minute 0 (05:30, 11:30, 17:30, 23:30 IST / 00Z, 06Z, 12Z, 18Z UTC)";
    }
    if (cronExpression === "30 21 * * *") {
      return "Daily at 03:00 IST (21:30 UTC)";
    }
    if (cronExpression === "0 */3 * * *") {
      return "Every 3 hours at minute 0 (8 runs per day in IST)";
    }
    if (cronExpression === "0 * * * *") {
      return "Every hour at minute 0 (24 runs per day)";
    }

    return `At minute ${min}, hour ${hour}, day of month ${dom}, month ${mon}, day of week ${dow}`;
  }, [cronExpression]);

  const handleSave = () => {
    if (!isValidCron) {
      toast.error("Please provide a valid 5-part cron expression.");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Operational schedule updated successfully", {
        description: `Pipeline scheduled: ${cronExpression} (Timezone: Asia/Kolkata IST)`
      });
    }, 400);
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-text-1">Operational Scheduler Configuration</h3>
          </div>
          <p className="text-xs text-text-3 mt-0.5">
            Automated pipeline trigger rules ? Indian Standard Time (IST, UTC+05:30)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Timezone: Asia/Kolkata (IST, UTC+05:30)</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-2">Recommended Operational Presets</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => {
            const isSelected = selectedPreset === p.label;
            return (
              <div
                key={p.label}
                onClick={() => handleSelectPreset(p)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-cyan-950/30 border-cyan-500/60 shadow-md shadow-cyan-500/10"
                    : "bg-surface-2/40 border-border/50 hover:border-border"
                }`}
              >
                <div>
                  <div className="font-semibold text-text-1">{p.label}</div>
                  <div className="text-[11px] text-text-3 mt-1 leading-snug">{p.description}</div>
                </div>
                <div className="font-mono text-[11px] text-cyan-400 bg-surface-2/80 px-2 py-0.5 rounded border border-border/30 w-fit">
                  {p.cron}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Cron Editor & Human Preview */}
      <div className="p-4 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-2">Cron Expression:</span>
            <input
              type="text"
              value={cronExpression}
              onChange={(e) => {
                setCronExpression(e.target.value);
                setSelectedPreset("Custom");
              }}
              className="px-3 py-1 text-xs font-mono rounded-lg bg-surface-1 border border-border text-cyan-300 focus:outline-none focus:border-cyan-400 w-48 font-bold"
            />
            {isValidCron ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid syntax
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Invalid syntax (expected 5 fields)
              </span>
            )}
          </div>

          <div className="text-xs text-text-2 flex items-center gap-2">
            <span className="text-text-3 font-medium">Preview:</span>
            <span className="text-cyan-300 font-medium">{humanReadable}</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!isValidCron || isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving..." : "Save Schedule"}</span>
        </button>
      </div>
    </GlassCard>
  );
}

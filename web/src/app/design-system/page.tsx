"use client";

import React, { useState } from "react";
import {
  Sun,
  Moon,
  Sparkles,
  Layers,
  Activity,
  Cpu,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Eye,
  RefreshCw,
  Search,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { MetricCard } from "@/components/ui/MetricCard";
import { ModelBadge } from "@/components/ui/ModelBadge";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LeadSlider } from "@/components/ui/LeadSlider";
import { Combobox } from "@/components/ui/Combobox";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { Tooltip } from "@/components/ui/Tooltip";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Kbd } from "@/components/ui/Kbd";
import { Legend } from "@/components/ui/Legend";
import { GradientText } from "@/components/ui/GradientText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { fadeUp, stagger, layoutSpring, drawIn, crossfade } from "@/lib/motion";

export default function DesignSystemShowroom() {
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(true);
  const [segmentedValue, setSegmentedValue] = useState("rain");
  const [sliderLead, setSliderLead] = useState(72);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comboboxValue, setComboboxValue] = useState("DL");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [motionTrigger, setMotionTrigger] = useState(0);

  // Theme toggle with localStorage persistence
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("samanvay-theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("samanvay-theme", "light");
    }
  };

  // Sample data for DataTable
  const sampleJurisdictions = [
    { code: "DL", name: "Delhi (NCT)", zone: "Northwest India", alert: "GREEN", rain: 6.8, gust: 32.4 },
    { code: "MH", name: "Maharashtra", zone: "Central India", alert: "ORANGE", rain: 124.5, gust: 78.0 },
    { code: "GJ", name: "Gujarat", zone: "Central India", alert: "RED", rain: 215.2, gust: 104.5 },
    { code: "KA", name: "Karnataka", zone: "South Peninsular", alert: "YELLOW", rain: 74.0, gust: 54.0 },
    { code: "KL", name: "Kerala", zone: "South Peninsular", alert: "ORANGE", rain: 142.8, gust: 82.5 },
    { code: "WB", name: "West Bengal", zone: "East & Northeast", alert: "YELLOW", rain: 88.5, gust: 62.0 },
    { code: "AS", name: "Assam", zone: "East & Northeast", alert: "YELLOW", rain: 95.0, gust: 48.0 },
    { code: "RJ", name: "Rajasthan", zone: "Northwest India", alert: "GREEN", rain: 2.1, gust: 36.0 },
  ];

  const columns: Column<typeof sampleJurisdictions[0]>[] = [
    { key: "name", header: "State / UT", sortable: true },
    { key: "zone", header: "IMD Zone", sortable: true },
    {
      key: "alert",
      header: "Alert Tier",
      align: "center",
      sortable: true,
      render: (item) => <AlertBadge tier={item.alert as any} />,
    },
    {
      key: "rain",
      header: "24h Rain (mm)",
      align: "right",
      sortable: true,
      render: (item) => <span className="font-bold text-[var(--accent-cyan)]">{item.rain} mm</span>,
    },
    {
      key: "gust",
      header: "Peak Gust",
      align: "right",
      sortable: true,
      render: (item) => <span className="text-[var(--accent-violet)]">{item.gust} km/h</span>,
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8 space-y-12 max-w-7xl mx-auto aurora-bg">
      {/* Top Hero Banner */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-cyan-500/10 px-2 py-1 font-mono text-xs font-bold text-[var(--accent-cyan)] border border-cyan-500/30">
              STEP 1
            </span>
            <GradientText className="font-heading text-2xl sm:text-3xl font-black">
              SAMANVAY Design System Showroom
            </GradientText>
          </div>
          <p className="text-xs text-[var(--text-2)] mt-1.5 max-w-2xl font-mono">
            &quot;Aurora Weather-Ops&quot; operational design tokens, 20 accessible components, motion presets,
            and IMD criteria compliance for MoES / NCMRWF (PS 26081).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme Mode"
            className="flex items-center space-x-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-3.5 py-2 font-mono text-xs font-semibold text-[var(--text-1)] shadow-sm hover:border-[var(--accent-cyan)] hover:shadow-[var(--glow)] transition"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-600" />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </header>

      {/* 1. Design Tokens: Surfaces & Typography */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Layers className="h-4 w-4 text-[var(--accent-cyan)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">
            1. Design Tokens: Surfaces, Text & Accents
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] p-4 flex flex-col justify-between h-28 shadow-sm">
            <span className="font-bold text-[var(--text-1)]">surface-0 (Void)</span>
            <span className="text-[10px] text-[var(--text-3)]">{isDark ? "#070B14" : "#F8FAFC"}</span>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 flex flex-col justify-between h-28 shadow-sm">
            <span className="font-bold text-[var(--text-1)]">surface-1 (Base)</span>
            <span className="text-[10px] text-[var(--text-3)]">{isDark ? "#0B1222" : "#FFFFFF"}</span>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 flex flex-col justify-between h-28 backdrop-blur-md shadow-sm">
            <span className="font-bold text-[var(--text-1)]">surface-2 (Glass)</span>
            <span className="text-[10px] text-[var(--text-3)]">{isDark ? "rgba(15,23,42,0.78)" : "rgba(241,245,249,0.95)"}</span>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-4 flex flex-col justify-between h-28 shadow-sm">
            <span className="font-bold text-[var(--text-1)]">surface-3 (Pop)</span>
            <span className="text-[10px] text-[var(--text-3)]">{isDark ? "#1E293B" : "#E2E8F0"}</span>
          </div>
        </div>
      </section>

      {/* 2. 7 Operational Forecast Source Badges */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Cpu className="h-4 w-4 text-[var(--accent-violet)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">
            2. The 7 Operational Forecast Sources (Fixed Immutable Palettes)
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <ModelBadge name="NCUM-G" type="NWP" color="#06B6D4" resolution="12km" />
          <ModelBadge name="NEPS" type="Ensemble" color="#3B82F6" resolution="21 Mem" />
          <ModelBadge name="IMD-GFS" type="NWP" color="#10B981" resolution="12km" />
          <ModelBadge name="ECMWF-IFS" type="NWP" color="#6366F1" resolution="9km" />
          <ModelBadge name="GraphCast" type="AI" color="#8B5CF6" resolution="0.25°" />
          <ModelBadge name="Pangu-Weather" type="AI" color="#D946EF" resolution="0.25°" />
          <ModelBadge name="FourCastNet" type="AI" color="#EC4899" resolution="0.25°" />
          <ModelBadge name="SAMANVAY" type="Blended" color="#00F5FF" resolution="Consensus" />
        </div>
      </section>

      {/* 3. IMD Extreme Event Alert Tiers & Hatch Patterns */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <ShieldAlert className="h-4 w-4 text-[var(--alert-red)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">
            3. IMD Criteria Warning Tiers (With Color-Blind Accessible Patterns)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard elevation={2} className="p-4 space-y-2">
            <AlertBadge tier="GREEN" />
            <p className="text-xs text-[var(--text-2)] font-mono">
              Rainfall &lt; 64.5mm. Standard district readiness, no operational warnings.
            </p>
          </GlassCard>

          <GlassCard elevation={2} className="p-4 space-y-2">
            <AlertBadge tier="YELLOW" />
            <p className="text-xs text-[var(--text-2)] font-mono">
              Rainfall 64.5 - 115.5mm. Dot pattern overlay. Localized waterlogging watch.
            </p>
          </GlassCard>

          <GlassCard elevation={2} className="p-4 space-y-2">
            <AlertBadge tier="ORANGE" />
            <p className="text-xs text-[var(--text-2)] font-mono">
              Rainfall 115.6 - 204.4mm. Stripe pattern overlay. District magistrate alert.
            </p>
          </GlassCard>

          <GlassCard elevation={2} className="p-4 space-y-2">
            <AlertBadge tier="RED" />
            <p className="text-xs text-[var(--text-2)] font-mono">
              Rainfall &gt; 204.5mm. Cross-hatch pattern overlay. Immediate NDRF mobilization.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 4. Metric Cards & Sparklines */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Activity className="h-4 w-4 text-[var(--accent-cyan)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">
            4. MetricCard (Real-time Count-up + Sparkline + Delta + Tooltip)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Blended Rain Forecast"
            value={84.6}
            unit="mm/24h"
            delta={{ value: 14.2, isPositiveGood: false, period: "prev run" }}
            sparklineData={[42, 55, 60, 48, 70, 85, 84.6]}
            tooltip="Consensus precipitation over Delhi NCR at lead +72h"
            accentColor="#06B6D4"
          />
          <MetricCard
            label="Peak Wind Gust"
            value={76.2}
            unit="km/h"
            delta={{ value: 8.5, isPositiveGood: false, period: "24h ago" }}
            sparklineData={[30, 42, 50, 65, 72, 76.2]}
            tooltip="Maximum squally gale gust in Saurashtra coastal belt"
            accentColor="#8B5CF6"
          />
          <MetricCard
            label="PINN Mass Conservation"
            value={0.28}
            unit="% residual"
            decimals={2}
            delta={{ value: -93.7, isPositiveGood: true, period: "pure AI" }}
            sparklineData={[4.8, 3.2, 1.5, 0.8, 0.4, 0.28]}
            tooltip="Moisture flux divergence constraint satisfaction"
            accentColor="#10B981"
          />
        </div>
      </section>

      {/* 5. Interactive Controls: SegmentedControl, LeadSlider, Combobox */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Sliders className="h-4 w-4 text-[var(--accent-cyan)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">
            5. Interactive Controls: SegmentedControl, LeadSlider, Combobox
          </h2>
        </div>

        <GlassCard elevation={2} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Segmented Control */}
            <div>
              <span className="block font-mono text-xs font-semibold text-[var(--text-2)] mb-2 uppercase">
                Variable Selector (SegmentedControl)
              </span>
              <SegmentedControl
                value={segmentedValue}
                onChange={setSegmentedValue}
                options={[
                  { id: "rain", label: "Rainfall" },
                  { id: "tmax", label: "Tmax" },
                  { id: "wind", label: "10m Wind" },
                  { id: "gust", label: "Peak Gust" },
                ]}
              />
            </div>

            {/* Combobox */}
            <div>
              <span className="block font-mono text-xs font-semibold text-[var(--text-2)] mb-2 uppercase">
                Searchable Jurisdiction (Combobox)
              </span>
              <Combobox
                value={comboboxValue}
                onChange={setComboboxValue}
                options={[
                  { value: "DL", label: "Delhi (NCT) — Northwest" },
                  { value: "MH", label: "Maharashtra — Central" },
                  { value: "GJ", label: "Gujarat — Central" },
                  { value: "KA", label: "Karnataka — South" },
                  { value: "KL", label: "Kerala — South" },
                  { value: "WB", label: "West Bengal — East" },
                  { value: "AS", label: "Assam — Northeast" },
                ]}
              />
            </div>
          </div>

          {/* LeadSlider */}
          <div className="pt-2 border-t border-[var(--border)]">
            <span className="block font-mono text-xs font-semibold text-[var(--text-2)] mb-2 uppercase">
              Operational Lead Horizon Scrubber (Day 1 to Day 10)
            </span>
            <LeadSlider
              value={sliderLead}
              onChange={setSliderLead}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
            />
          </div>
        </GlassCard>
      </section>

      {/* 6. DataTable Component */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Eye className="h-4 w-4 text-[var(--accent-cyan)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">
            6. Accessible DataTable (Sorting, Filtering, Search & Badges)
          </h2>
        </div>

        <DataTable
          data={sampleJurisdictions}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search state name..."
        />
      </section>

      {/* 7. Skeletons, Overlays & Utility Components */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[var(--border)] pb-2">
          <Sparkles className="h-4 w-4 text-[var(--accent-violet)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">
            7. Overlays, Feedback, Skeletons & Utilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skeletons */}
          <GlassCard elevation={2} className="p-5 space-y-3">
            <span className="font-mono text-xs font-bold text-[var(--text-2)] uppercase">
              Skeleton Variants (No blank spinners)
            </span>
            <div className="space-y-2">
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2" />
              <div className="flex space-x-3 items-center pt-2">
                <Skeleton variant="circle" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" className="w-2/3" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Interactive Triggers */}
          <GlassCard elevation={2} className="p-5 space-y-4 font-mono text-xs">
            <span className="font-bold text-[var(--text-2)] uppercase block">
              Interactive Dialog, Drawer, Toast & MagneticButton
            </span>

            <div className="flex flex-wrap gap-2.5">
              <MagneticButton onClick={() => setIsDialogOpen(true)}>
                Open Dialog
              </MagneticButton>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3.5 py-2 font-bold hover:border-[var(--accent-cyan)] transition"
              >
                Open Drawer
              </button>

              <button
                onClick={() =>
                  toast({
                    type: "warning",
                    title: "IMD Deluge Alert Issued",
                    message: "Gujarat Saurashtra coast exceeded 115.6mm threshold.",
                  })
                }
                className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-amber-400 font-bold hover:bg-amber-500/20 transition"
              >
                Trigger Warning Toast
              </button>
            </div>

            <div className="flex items-center space-x-3 pt-2 text-[11px] text-[var(--text-3)]">
              <span>Keyboard: <Kbd>⌘K</Kbd> <Kbd>Esc</Kbd></span>
              <span>Tooltips:</span>
              <Tooltip content="MoES Operational Threshold">
                <span className="underline decoration-dotted cursor-help text-[var(--text-1)]">Hover me</span>
              </Tooltip>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 8. Motion Presets Playground */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-[var(--accent-cyan)]" />
            <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">
              8. Motion Presets (Honours prefers-reduced-motion)
            </h2>
          </div>
          <button
            onClick={() => setMotionTrigger((t) => t + 1)}
            className="flex items-center space-x-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1 font-mono text-xs text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Re-trigger Animation</span>
          </button>
        </div>

        <motion.div
          key={motionTrigger}
          variants={stagger(0.1)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs"
        >
          <motion.div variants={fadeUp} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
            <strong className="text-[var(--accent-cyan)] block text-sm">fadeUp</strong>
            <p className="text-[var(--text-3)] mt-1">Staggered upward fade with subtle cubic-bezier easing.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
            <strong className="text-[var(--accent-violet)] block text-sm">layoutSpring</strong>
            <p className="text-[var(--text-3)] mt-1">Stiff, damped spring physics for active pill indicators.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
            <strong className="text-[var(--accent-magenta)] block text-sm">drawIn (SVG)</strong>
            <svg width="100%" height="24" className="mt-2 overflow-visible">
              <motion.path
                d="M 0 12 Q 50 0 100 12 T 200 12 T 300 12"
                fill="none"
                stroke="var(--accent-magenta)"
                strokeWidth="2.5"
                variants={drawIn}
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Dialog Modal */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="SAMANVAY Operational Advisory"
        description="Standard Operating Procedure Trigger Notice for Disaster Management."
      >
        <div className="space-y-3 font-mono text-xs text-[var(--text-2)]">
          <p>
            This accessible dialog is equipped with full focus trapping, ESC keyboard cancellation, and backdrop blur.
          </p>
          <div className="flex justify-end space-x-2 pt-3 border-t border-[var(--border)]">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--surface-3)]"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                setIsDialogOpen(false);
                toast({ type: "success", title: "Advisory Acknowledged", message: "Sent to SDMA operations queue." });
              }}
              className="rounded-lg bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] px-3 py-1.5 font-bold hover:bg-[var(--accent-cyan)]/30"
            >
              Acknowledge SOP
            </button>
          </div>
        </div>
      </Dialog>

      {/* Drawer Panel */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Jurisdiction Meteorological Telemetry"
      >
        <div className="space-y-4 font-mono text-xs text-[var(--text-2)]">
          <p>
            Detailed regional telemetry breakdown for <strong className="text-[var(--text-1)]">{comboboxValue}</strong>.
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-3)] block uppercase">Model Consensus</span>
              <span className="text-base font-bold text-[var(--accent-cyan)]">84.6 mm/24h</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-3)] block uppercase">IMD Severity Tier</span>
              <AlertBadge tier="ORANGE" className="mt-1" />
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

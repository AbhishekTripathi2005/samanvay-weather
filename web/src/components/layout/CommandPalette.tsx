"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Map,
  Layers,
  AlertTriangle,
  Mountain,
  CloudRain,
  Sliders,
  Cpu,
  BookOpen,
  Play,
  Sun,
  Moon,
  Download,
  Filter,
  Sparkles,
  HelpCircle,
  Bell,
  ArrowRight,
  CornerDownLeft,
  X
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

interface PaletteItem {
  id: string;
  category: "Navigation" | "Actions" | "Filters" | "Downloads";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  shortcut?: string;
  onSelect: () => void;
}

const REGION_MAP: Record<string, string> = {
  kerala: "KL",
  delhi: "DL",
  himachal: "HP",
  shimla: "HP",
  maharashtra: "MH",
  mumbai: "MH",
  gujarat: "GJ",
  rajasthan: "RJ",
  jaipur: "RJ",
  odisha: "OD",
  puri: "OD",
  uttarakhand: "UT",
  bengal: "WB",
  kolkata: "WB"
};

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setVariable,
    setLead,
    setRegion,
    setRegime,
    toggleTheme,
    theme,
    setIsRunBlendOpen,
    setIsTourOpen,
    setTourStep,
    setIsDemoMode,
    setDemoStep,
    setIsAlertsOpen
  } = useAppStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Focus on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Natural Language Filter Parser (e.g., "rain day 3 Kerala")
  const parsedFilterAction = useMemo<PaletteItem | null>(() => {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 3) return null;

    let detectedVar: string | null = null;
    let detectedLead: number | null = null;
    let detectedRegion: { name: string; code: string } | null = null;

    // Detect variable
    if (q.includes("rain") || q.includes("precip")) detectedVar = "rainfall";
    else if (q.includes("tmax") || q.includes("heat") || q.includes("warm")) detectedVar = "tmax";
    else if (q.includes("tmin") || q.includes("cold")) detectedVar = "tmin";
    else if (q.includes("gust")) detectedVar = "wind_gust";
    else if (q.includes("wind")) detectedVar = "wind_speed";

    // Detect lead
    const dayMatch = q.match(/day\s*([1-9]|10)/i) || q.match(/d([1-9]|10)/i);
    if (dayMatch) {
      detectedLead = parseInt(dayMatch[1], 10) * 24;
    } else {
      const hourMatch = q.match(/(\d{2,3})\s*h/i);
      if (hourMatch) detectedLead = parseInt(hourMatch[1], 10);
    }

    // Detect region
    for (const [key, code] of Object.entries(REGION_MAP)) {
      if (q.includes(key)) {
        detectedRegion = { name: key.charAt(0).toUpperCase() + key.slice(1), code };
        break;
      }
    }

    if (detectedVar || detectedLead || detectedRegion) {
      const parts: string[] = [];
      if (detectedVar) parts.push(`Variable: ${detectedVar}`);
      if (detectedLead) parts.push(`Lead: Day ${detectedLead / 24} (+${detectedLead}h)`);
      if (detectedRegion) parts.push(`Region: ${detectedRegion.name} (${detectedRegion.code})`);

      return {
        id: "parsed-filter",
        category: "Filters",
        title: `Apply Filter: ${parts.join(" · ")}`,
        subtitle: "Instantly update global atmospheric filters",
        icon: Filter,
        onSelect: () => {
          if (detectedVar) setVariable(detectedVar);
          if (detectedLead) setLead(detectedLead);
          if (detectedRegion) setRegion(detectedRegion.code);
          toast.success("Filters applied", {
            description: parts.join(" | ")
          });
          setIsCommandPaletteOpen(false);
          router.push("/forecast");
        }
      };
    }

    return null;
  }, [query, setVariable, setLead, setRegion, setIsCommandPaletteOpen, router]);

  // Base items catalog
  const staticItems = useMemo<PaletteItem[]>(() => [
    // Navigation
    {
      id: "nav-overview",
      category: "Navigation",
      title: "Command Center",
      subtitle: "National 0.5° multi-model consensus & alerts",
      icon: LayoutDashboard,
      shortcut: "G O",
      onSelect: () => {
        router.push("/overview");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-forecast",
      category: "Navigation",
      title: "Forecast Explorer",
      subtitle: "Interactive point plume & quantile inspector",
      icon: Map,
      shortcut: "G F",
      onSelect: () => {
        router.push("/forecast");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-models",
      category: "Navigation",
      title: "Model Matrix & Verification",
      subtitle: "7-model leaderboard, Taylor & win/loss diagrams",
      icon: Layers,
      shortcut: "G M",
      onSelect: () => {
        router.push("/models");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-extremes",
      category: "Navigation",
      title: "Disaster DSS (Extreme Weather)",
      subtitle: "Heavy rain, heatwave & wind threshold warnings",
      icon: AlertTriangle,
      shortcut: "G E",
      onSelect: () => {
        router.push("/extremes");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-impact",
      category: "Navigation",
      title: "Mountain Hydrology (Shimla)",
      subtitle: "Water balance bucket model & landslide DEM",
      icon: Mountain,
      shortcut: "G I",
      onSelect: () => {
        router.push("/impact");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-regimes",
      category: "Navigation",
      title: "Synoptic Weather Regimes",
      subtitle: "Monsoon trough, Western Disturbance transitions",
      icon: CloudRain,
      shortcut: "G R",
      onSelect: () => {
        router.push("/regimes");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-weights",
      category: "Navigation",
      title: "Adaptive Weights Map",
      subtitle: "Choropleth of winning models & reliability matrix",
      icon: Sliders,
      shortcut: "G W",
      onSelect: () => {
        router.push("/weights");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-ops",
      category: "Navigation",
      title: "Operational Ingestion Pipeline",
      subtitle: "Live 7-stage DAG execution & SSE streaming logs",
      icon: Cpu,
      shortcut: "G P",
      onSelect: () => {
        router.push("/ops");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "nav-about",
      category: "Navigation",
      title: "Methodology & Scientific Formulas",
      subtitle: "KaTeX equations, data sources, assumptions & glossary",
      icon: BookOpen,
      shortcut: "G A",
      onSelect: () => {
        router.push("/about");
        setIsCommandPaletteOpen(false);
      }
    },

    // Actions
    {
      id: "action-run-blend",
      category: "Actions",
      title: "Run Operational Blend Now",
      subtitle: "Trigger synthetic consensus pipeline execution",
      icon: Play,
      shortcut: "B",
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        setIsRunBlendOpen(true);
      }
    },
    {
      id: "action-demo",
      category: "Actions",
      title: "Start 2-Minute Evaluator Demo Mode",
      subtitle: "Automated scripted walkthrough across all pages",
      icon: Sparkles,
      shortcut: "D",
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        setDemoStep(0);
        setIsDemoMode(true);
      }
    },
    {
      id: "action-tour",
      category: "Actions",
      title: "Start Guided Product Tour",
      subtitle: "8-step interactive spotlight feature walkthrough",
      icon: HelpCircle,
      shortcut: "?",
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        setTourStep(0);
        setIsTourOpen(true);
      }
    },
    {
      id: "action-alerts",
      category: "Actions",
      title: "Open Notification Centre",
      subtitle: "View active severe weather alerts & history",
      icon: Bell,
      shortcut: "A",
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        setIsAlertsOpen(true);
      }
    },
    {
      id: "action-theme",
      category: "Actions",
      title: `Switch Theme to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      subtitle: "Toggle application color appearance",
      icon: theme === "dark" ? Sun : Moon,
      shortcut: "T",
      onSelect: () => {
        toggleTheme();
        setIsCommandPaletteOpen(false);
      }
    },

    // Downloads
    {
      id: "download-geojson",
      category: "Downloads",
      title: "Download State & District Vector Advisory (GeoJSON)",
      subtitle: "Multi-hazard polygon boundaries with P(extreme)",
      icon: Download,
      onSelect: () => {
        window.open("/api/export/geojson", "_blank");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "download-csv",
      category: "Downloads",
      title: "Download Consensus Tables & Quantiles (CSV)",
      subtitle: "36 states point forecast consensus, P10/P90",
      icon: Download,
      onSelect: () => {
        window.open("/api/export/csv", "_blank");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "download-netcdf",
      category: "Downloads",
      title: "Download Gridded Atmospheric Consensus (NetCDF-4)",
      subtitle: "0.25° CF-1.8 compliant atmospheric variables",
      icon: Download,
      onSelect: () => {
        window.open("/api/export/netcdf-stub", "_blank");
        setIsCommandPaletteOpen(false);
      }
    },
    {
      id: "download-pdf",
      category: "Downloads",
      title: "Download IMD Severe Weather Bulletin (PDF)",
      subtitle: "Official operational bulletin format for SDMAs",
      icon: Download,
      onSelect: () => {
        window.open("/api/export/pdf-stub", "_blank");
        setIsCommandPaletteOpen(false);
      }
    }
  ], [router, theme, toggleTheme, setIsCommandPaletteOpen, setIsRunBlendOpen, setIsDemoMode, setDemoStep, setIsTourOpen, setTourStep, setIsAlertsOpen]);

  // Combined filtered items
  const filteredItems = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];
    if (parsedFilterAction) {
      list.push(parsedFilterAction);
    }

    const q = query.toLowerCase().trim();
    if (!q) {
      return [...list, ...staticItems];
    }

    const matching = staticItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subtitle?.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchTitle || matchSub || matchCat;
    });

    return [...list, ...matching];
  }, [parsedFilterAction, query, staticItems]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    }
  };

  // Auto-scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-surface-1 border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="px-4 py-3.5 border-b border-border/70 flex items-center gap-3 bg-surface-2/40">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or filter (e.g. 'rain day 3 Kerala', 'models', 'theme')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-text-1 placeholder:text-text-3 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSelectedIndex(0);
              }}
              className="text-text-3 hover:text-text-1 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex text-[10px] font-mono text-text-3 bg-surface-2 px-2 py-0.5 rounded border border-border/40">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-3 italic">
              No matching commands or actions found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = selectedIndex === index;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-cyan-500/15 border border-cyan-500/40 text-text-1"
                      : "border border-transparent text-text-2 hover:bg-surface-2/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      item.category === "Filters" ? "bg-amber-500/20 text-amber-300" :
                      item.category === "Actions" ? "bg-cyan-500/20 text-cyan-300" :
                      item.category === "Downloads" ? "bg-emerald-500/20 text-emerald-300" :
                      "bg-surface-2 text-text-2"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-text-1 truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.category === "Filters" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            NLP Filter
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-text-3 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="font-mono text-[10px] text-text-3 px-1.5 py-0.5 rounded bg-surface-2 border border-border/40">
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2 border-t border-border/50 bg-surface-2/30 flex items-center justify-between text-[11px] text-text-3">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to close</span>
          </div>
          <span className="text-cyan-400 font-mono text-[10px]">
            SAMANVAY Command Palette
          </span>
        </div>
      </div>
    </div>
  );
}

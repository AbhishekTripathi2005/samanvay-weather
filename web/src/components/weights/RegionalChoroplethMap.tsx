"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Download, Share2, Layers, ShieldCheck, MapPin, Eye } from "lucide-react";
import { RegionWeightDetail } from "@/lib/types";
import { exportElementAsPng } from "@/lib/export";
import { toast } from "sonner";

interface RegionalChoroplethMapProps {
  regions: RegionWeightDetail[];
  selectedRegion: string;
  onSelectRegion: (code: string) => void;
  variable: string;
  leadHours: number;
}

export function RegionalChoroplethMap({
  regions,
  selectedRegion,
  onSelectRegion,
  variable,
  leadHours
}: RegionalChoroplethMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionWeightDetail | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [accessiblePatterns, setAccessiblePatterns] = useState<boolean>(true);

  // Geographic projection from lat (6-38) & lon (68-98) to SVG viewport (760 x 820)
  const project = (lat: number, lon: number): [number, number] => {
    const minLat = 6.0, maxLat = 38.0;
    const minLon = 68.0, maxLon = 98.0;
    const x = ((lon - minLon) / (maxLon - minLon)) * 660 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 720 + 45;
    return [x, y];
  };

  const activeRegion = hoveredRegion || regions.find((r) => r.code === selectedRegion) || regions[0];

  // Export GeoJSON
  const handleExportGeoJson = () => {
    const featureCollection = {
      type: "FeatureCollection",
      metadata: {
        system: "SAMANVAY AI-NWP Blending Platform",
        variable,
        lead_hours: leadHours,
        generated_at: new Date().toISOString()
      },
      features: regions.map((r) => ({
        type: "Feature",
        properties: {
          code: r.code,
          name: r.name,
          zone: r.zone,
          terrain: r.terrain,
          dominant_model: r.dominant_model,
          confidence: r.confidence,
          sample_size: r.sample_size,
          weights: r.weights
        },
        geometry: {
          type: "Point",
          coordinates: [r.lon, r.lat]
        }
      }))
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
      type: "application/geo+json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `samanvay_weights_${variable}_lead${leadHours}h.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Exported map weights as GeoJSON");
  };

  // Export PNG
  const handleExportPng = () => {
    exportElementAsPng("choropleth-map-container", `samanvay_weights_map_${variable}_${leadHours}h.png`);
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20 relative">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-1 tracking-tight">
              Best Model Allocation by Region
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold">
              Day {leadHours / 24} (+{leadHours}h)
            </span>
          </div>
          <p className="text-xs text-text-3">
            Dominant model per State & UT with accessible texture patterns (NWP hatch, Ensemble dots, AI grid)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Pattern Toggle */}
          <button
            onClick={() => setAccessiblePatterns(!accessiblePatterns)}
            title="Toggle Accessibility Texture Patterns"
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              accessiblePatterns
                ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-300"
                : "bg-surface-2 border border-border text-text-3 hover:text-text-1"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Patterns</span>
          </button>

          <button
            onClick={handleExportGeoJson}
            title="Export as GeoJSON"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 border border-border text-text-2 hover:text-text-1 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>GeoJSON</span>
          </button>

          <button
            onClick={handleExportPng}
            title="Export Map PNG"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 border border-border text-text-2 hover:text-text-1 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* SVG Map Container */}
      <div
        id="choropleth-map-container"
        className="w-full h-[580px] relative rounded-xl overflow-hidden bg-[#070B14] border border-cyan-500/20 flex items-center justify-center select-none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      >
        <svg
          viewBox="0 0 760 820"
          className="w-full h-full max-h-[570px]"
          aria-label="India Map of Best Forecast Models by Region"
        >
          <defs>
            {/* Ambient Maritime Background Radial Glow */}
            <radialGradient id="oceanMaritimeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0B152A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#070B14" stopOpacity="0.2" />
            </radialGradient>

            {/* Pattern 1: NWP Diagonal Stripes */}
            <pattern id="pattern-nwp" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            </pattern>

            {/* Pattern 2: Ensemble Polka Dots */}
            <pattern id="pattern-ensemble" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.5" fill="rgba(255,255,255,0.4)" />
            </pattern>

            {/* Pattern 3: AI Square Crosshatch */}
            <pattern id="pattern-ai" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 8 0 M 0 0 L 0 8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            </pattern>

            {/* Region Glow Filter */}
            <filter id="selectionGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background fill */}
          <rect width="760" height="820" fill="url(#oceanMaritimeGlow)" />

          {/* Subcontinent Schematic Outline */}
          <path
            d="M 170 180 L 260 90 L 370 120 L 460 210 L 480 340 L 430 460 L 360 620 L 330 730 L 310 730 L 260 550 L 190 380 L 140 280 Z"
            fill="#0F172A"
            stroke="rgba(0, 245, 255, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* 36 States/UTs Choropleth Cells & Pins */}
          {regions.map((reg) => {
            const [x, y] = project(reg.lat, reg.lon);
            const isSelected = selectedRegion === reg.code;
            const isHovered = hoveredRegion?.code === reg.code;

            // Determine pattern fill based on dominant model type
            let patternUrl = "";
            if (accessiblePatterns) {
              if (reg.dominant_type === "NWP") patternUrl = "url(#pattern-nwp)";
              else if (reg.dominant_type === "Ensemble") patternUrl = "url(#pattern-ensemble)";
              else if (reg.dominant_type === "AI") patternUrl = "url(#pattern-ai)";
            }

            return (
              <g
                key={reg.code}
                tabIndex={0}
                role="button"
                aria-label={`${reg.name}: Winning model ${reg.dominant_model}, confidence ${Math.round(reg.confidence * 100)}%`}
                onMouseEnter={() => setHoveredRegion(reg)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => onSelectRegion(reg.code)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectRegion(reg.code);
                  }
                }}
                className="cursor-pointer transition-transform duration-200 outline-none"
              >
                {/* Outer halo on select/hover */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={26}
                    fill={reg.dominant_color}
                    fillOpacity={0.2}
                    filter="url(#selectionGlow)"
                  />
                )}

                {/* Base Choropleth State Disk */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 18 : isHovered ? 17 : 14}
                  fill={reg.dominant_color}
                  stroke={isSelected ? "#FFFFFF" : isHovered ? "#00F5FF" : "rgba(255,255,255,0.25)"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                  style={{
                    transition: "fill 0.4s ease, r 0.2s ease, stroke 0.2s ease"
                  }}
                />

                {/* Accessible Pattern Overlay */}
                {accessiblePatterns && patternUrl && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 18 : isHovered ? 17 : 14}
                    fill={patternUrl}
                    pointerEvents="none"
                  />
                )}

                {/* State Code Label */}
                <text
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={isSelected ? 9.5 : 8.5}
                  fontWeight="bold"
                  fontFamily="monospace"
                  pointerEvents="none"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {reg.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Detailed Hover Card */}
        {activeRegion && (
          <div
            className="absolute z-30 pointer-events-none rounded-xl border border-cyan-500/40 bg-[#070B14]/95 backdrop-blur-md p-3.5 shadow-2xl min-w-[240px] text-xs font-mono transition-all"
            style={{
              top: Math.min(mousePos.y + 15, 380),
              left: Math.min(mousePos.x + 20, 480)
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10">
              <div>
                <span className="font-bold text-text-1 text-sm">{activeRegion.name}</span>
                <span className="text-[10px] text-cyan-400 ml-1.5">({activeRegion.code})</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-3 font-mono">
                {activeRegion.zone}
              </span>
            </div>

            {/* Winning Model Banner */}
            <div className="flex items-center justify-between p-1.5 rounded bg-cyan-950/40 border border-cyan-500/30 mb-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeRegion.dominant_color }}
                />
                <span className="font-bold text-cyan-300 capitalize">{activeRegion.dominant_model}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-surface-3 text-text-3">
                  {activeRegion.dominant_type}
                </span>
              </div>
              <span className="font-bold text-cyan-300">
                {(activeRegion.weights[activeRegion.dominant_model] * 100).toFixed(1)}%
              </span>
            </div>

            {/* Top 3 Models Donut / Bar Breakdown */}
            <div className="flex flex-col gap-1 mb-2">
              <span className="text-[10px] text-text-3">Top 3 Contributing Models:</span>
              {activeRegion.top_3.map((m, idx) => (
                <div key={m.id} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-text-2">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
                      />
                    </div>
                    <span className="w-8 text-right font-semibold text-text-1">{m.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence & Sample Size */}
            <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] text-text-3">
              <span>Confidence: <strong className="text-emerald-400 font-mono">{Math.round(activeRegion.confidence * 100)}%</strong></span>
              <span>Sample: <strong className="text-text-2 font-mono">{activeRegion.sample_size} pairs</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Accessible Model Palette Legend with Pattern Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <span className="text-text-3">Models:</span>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#06B6D4] border border-white/20" />
            <span className="text-text-2">NCUM-G (NWP)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white/20" />
            <span className="text-text-2">NEPS (Ensemble)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#10B981] border border-white/20" />
            <span className="text-text-2">IMD-GFS (NWP)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#6366F1] border border-white/20" />
            <span className="text-text-2">ECMWF-IFS (NWP)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6] border border-white/20" />
            <span className="text-text-2">GraphCast (AI)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#D946EF] border border-white/20" />
            <span className="text-text-2">Pangu (AI)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EC4899] border border-white/20" />
            <span className="text-text-2">FourCastNet (AI)</span>
          </div>
        </div>

        {/* Texture Swatches */}
        {accessiblePatterns && (
          <div className="flex items-center gap-3 text-[10px] font-mono text-text-3">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 border border-white/40 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] rounded" />
              <span>NWP (Stripes)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 border border-white/40 bg-[radial-gradient(circle,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:4px_4px] rounded" />
              <span>Ensemble (Dots)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 border border-white/40 bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:4px_4px] rounded" />
              <span>AI (Grid)</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

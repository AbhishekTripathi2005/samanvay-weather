"use client";

import React, { useRef } from "react";
import { useKpisQuery } from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, useInView } from "framer-motion";
import { Layers, MapPin, Clock, TrendingUp } from "lucide-react";

export function StatsStrip() {
  const { data: kpis } = useKpisQuery();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const skillVal = kpis?.blend_skill_score_24h?.value_pct ?? 19.8;

  const stats = [
    {
      label: "Operational Models Blended",
      value: "7",
      unit: "NWP & AI",
      detail: "NCUM, NEPS, IFS, GFS, GraphCast, Pangu, FourCastNet",
      icon: Layers,
      color: "text-cyan-400",
      accent: "from-cyan-500/20 to-transparent"
    },
    {
      label: "Pan-India Spatial Coverage",
      value: "36",
      unit: "States & UTs",
      detail: "0.5° Gridded Masked Subcontinent Grid",
      icon: MapPin,
      color: "text-indigo-400",
      accent: "from-indigo-500/20 to-transparent"
    },
    {
      label: "Operational Horizon",
      value: "240",
      unit: "Hours",
      detail: "Day-1 to Day-10 at 24h Synoptic Steps",
      icon: Clock,
      color: "text-violet-400",
      accent: "from-violet-500/20 to-transparent"
    },
    {
      label: "Consensus Skill Gain",
      value: `+${skillVal.toFixed(1)}`,
      unit: "%",
      detail: "Strict RMSE reduction over best individual model",
      icon: TrendingUp,
      color: "text-emerald-400",
      accent: "from-emerald-500/20 to-transparent"
    }
  ];

  return (
    <section id="stats" ref={ref} className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <GlassCard className="p-5 flex flex-col justify-between h-full relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.accent} rounded-bl-full pointer-events-none`} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-medium text-text-3 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-lg bg-surface-2 ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold tracking-tight text-text-1 font-mono">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-text-2 font-mono">
                    {stat.unit}
                  </span>
                </div>

                <p className="text-[11px] text-text-3 leading-relaxed">
                  {stat.detail}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

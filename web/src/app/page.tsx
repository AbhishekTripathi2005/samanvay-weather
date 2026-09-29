"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WindFlowCanvas } from "@/components/landing/WindFlowCanvas";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { TypewriterText } from "@/components/landing/TypewriterText";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { StorytellingSection } from "@/components/landing/StorytellingSection";
import { WhyBlendingWins } from "@/components/landing/WhyBlendingWins";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { DemoModal } from "@/components/landing/DemoModal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ArrowRight, Play, ShieldCheck, Sparkles, CheckCircle2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const typewriterPhrases = [
    "Adaptive AI-NWP Blending for Disaster Management",
    "Empirical Quantile Mapping with Extreme Tail Preservation",
    "Consensus Guidance across 36 Indian States & UTs",
    "Zero Single-Model Bias. Bounded P10–P90 Uncertainty Fan",
    "100% Offline Operational Meteorological Command Center"
  ];

  return (
    <div className="relative min-h-screen bg-surface-0 text-text-1 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Fixed Landing Navigation */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] w-full flex flex-col justify-center items-center px-4 md:px-8 overflow-hidden select-none">
        {/* WebGL / Canvas Particle Wind Flow-Field Masked to India */}
        <WindFlowCanvas />

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 pt-16">
          {/* Operational Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-1/80 border border-cyan-500/40 backdrop-blur-md shadow-lg shadow-cyan-500/10"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wide text-cyan-300 uppercase">
              MoES / NCMRWF • Problem Statement 26081
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]"
          >
            Many models.{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              One trusted forecast.
            </span>
          </motion.h1>

          {/* Typewriter Subline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-8 flex items-center justify-center text-sm sm:text-base md:text-lg font-mono text-cyan-300/90 font-medium"
          >
            <TypewriterText phrases={typewriterPhrases} />
          </motion.div>

          {/* Supporting Pitch */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl text-xs sm:text-sm md:text-base text-text-2 leading-relaxed"
          >
            Seamlessly fusing deterministic physics (NCUM-G, ECMWF-IFS, IMD-GFS), 21-member NEPS ensembles, and AI foundation models (GraphCast, Pangu, FourCastNet) into calibrated operational consensus for India.
          </motion.p>

          {/* Magnetic CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-3"
          >
            <Link href="/overview">
              <MagneticButton className="px-6 py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:opacity-95 text-white shadow-xl shadow-cyan-500/25 flex items-center gap-2 group transition-all">
                <span>Open Command Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </Link>

            <MagneticButton
              onClick={() => setIsDemoOpen(true)}
              className="px-6 py-3.5 text-sm font-semibold rounded-xl bg-surface-1/80 hover:bg-surface-2 border border-border/80 text-text-1 backdrop-blur-md shadow-lg flex items-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Watch demo</span>
            </MagneticButton>
          </motion.div>

          {/* Verification Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-[11px] font-mono text-text-3"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dual-Benchmark Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>0.5° Spatially Gridded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>100% Offline Operational</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Cue Indicator */}
        <a
          href="#stats"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-text-3 hover:text-cyan-400 transition-colors"
          aria-label="Scroll to stats"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">Explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-cyan-400" />
        </a>
      </section>

      {/* Animated Stats Strip */}
      <StatsStrip />

      {/* Scroll-Driven Storytelling */}
      <StorytellingSection />

      {/* Why Blending Wins */}
      <WhyBlendingWins />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Footer */}
      <LandingFooter />

      {/* Interactive Simulation Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}

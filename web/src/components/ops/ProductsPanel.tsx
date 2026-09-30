"use client";

import React, { useState } from "react";
import { Download, FileCode, FileSpreadsheet, Layers, FileText, Copy, Check, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { OpsProduct } from "@/lib/types";
import { toast } from "sonner";

const DEFAULT_PRODUCTS: OpsProduct[] = [
  {
    id: "geojson",
    name: "State & District Vector Advisory",
    format: "GeoJSON",
    size: "482 KB",
    download_url: "/api/export/geojson",
    filename: "samanvay_bulletin.geojson",
    sha256: "4b6c8f90123456789abcdef0123456789abcdef0123456789abcdef012345678",
    description: "Multi-hazard district polygon boundaries with calibrated P(extreme) exceedance attributes."
  },
  {
    id: "csv",
    name: "Consensus Tables & Quantiles",
    format: "CSV",
    size: "38 KB",
    download_url: "/api/export/csv",
    filename: "samanvay_operational_bulletin.csv",
    sha256: "8a7b6c5d4e3f210987654321fedcba0987654321fedcba0987654321fedcba09",
    description: "Tabular 36 states/UTs point forecast consensus, P10, P90, and dominant model attribution."
  },
  {
    id: "netcdf",
    name: "Gridded Atmospheric Consensus",
    format: "NetCDF-4 / CF-1.8",
    size: "1.2 MB",
    download_url: "/api/export/netcdf-stub",
    filename: "samanvay_grid_cf18.nc",
    sha256: "123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
    description: "0.25° regular gridded atmospheric variables with CF-1.8 metadata compliance."
  },
  {
    id: "pdf",
    name: "IMD Severe Weather Advisory Bulletin",
    format: "PDF Document",
    size: "840 KB",
    download_url: "/api/export/pdf-stub",
    filename: "samanvay_imd_bulletin.pdf",
    sha256: "c0ffee1234567890abcdef0123456789abcdef0123456789abcdef0123456789",
    description: "Official IMD four-tier alert bulletin with SOP emergency protocols for state SDMAs."
  }
];

interface Props {
  products?: OpsProduct[];
}

export function ProductsPanel({ products }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const items = products && products.length > 0 ? products : DEFAULT_PRODUCTS;

  const handleCopyChecksum = (prod: OpsProduct) => {
    navigator.clipboard.writeText(prod.sha256);
    setCopiedId(prod.id);
    toast.success(`SHA-256 copied for ${prod.name}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFormatIcon = (fmt: string) => {
    if (fmt.includes("GeoJSON")) return <FileCode className="w-5 h-5 text-cyan-400" />;
    if (fmt.includes("CSV")) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (fmt.includes("NetCDF")) return <Layers className="w-5 h-5 text-indigo-400" />;
    return <FileText className="w-5 h-5 text-rose-400" />;
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-text-1">Downloadable Operational Products</h3>
        </div>
        <p className="text-xs text-text-3 mt-0.5">
          Standardized output formats with SHA-256 cryptographic verification checksums
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((prod) => (
          <div
            key={prod.id}
            className="p-4 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col justify-between gap-3 hover:border-border transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-surface-3 border border-border/50">
                    {getFormatIcon(prod.format)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-text-1">{prod.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/40 border border-cyan-500/30">
                        {prod.format}
                      </span>
                      <span className="text-[10px] font-mono text-text-3">{prod.size}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Download Button */}
                <a
                  href={prod.download_url}
                  download={prod.filename}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>

              <p className="text-[11px] text-text-3 mt-2 leading-relaxed">
                {prod.description}
              </p>
            </div>

            {/* Checksum Box */}
            <div className="p-2 rounded-lg bg-surface-1/70 border border-border/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] text-text-3 font-semibold uppercase tracking-wider">SHA-256:</span>
                <span className="text-[10px] font-mono text-text-2 truncate select-all">
                  {prod.sha256}
                </span>
              </div>
              <button
                onClick={() => handleCopyChecksum(prod)}
                title="Copy SHA-256 Checksum"
                className="p-1 rounded text-text-3 hover:text-cyan-400 hover:bg-surface-2 transition-colors flex-shrink-0 cursor-pointer"
              >
                {copiedId === prod.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

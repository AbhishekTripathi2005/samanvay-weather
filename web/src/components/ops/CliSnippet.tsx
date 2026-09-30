"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Code2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";

interface CommandTab {
  id: string;
  label: string;
  cmd: string;
  lang: string;
}

const COMMAND_TABS: CommandTab[] = [
  {
    id: "cli",
    label: "SAMANVAY CLI",
    cmd: "python -m samanvay.run --variable rain --lead 1-10 --regime auto --method stacked_nnls --export geojson,csv,nc",
    lang: "bash"
  },
  {
    id: "curl",
    label: "cURL (SSE Stream)",
    cmd: "curl -N -X POST \"http://localhost:8000/api/ops/run\" \\\n  -H \"Accept: text/event-stream\" \\\n  -H \"Content-Type: application/json\"",
    lang: "bash"
  },
  {
    id: "sdk",
    label: "Python SDK",
    cmd: "from samanvay.engine import BlendingEngine\n\n# Run live 7-model consensus blending\nresult = BlendingEngine.run_cycle(\n    variable='rainfall',\n    lead_range=(24, 240),\n    regime='Active monsoon',\n    export_formats=['geojson', 'netcdf']\n)\nprint(f\"Run complete: {result.run_id}, skill gain: {result.skill_delta}\")",
    lang: "python"
  }
];

export function CliSnippet() {
  const [activeTab, setActiveTab] = useState<string>("cli");
  const [copied, setCopied] = useState<boolean>(false);

  const active = COMMAND_TABS.find((t) => t.id === activeTab) || COMMAND_TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(active.cmd);
    setCopied(true);
    toast.success("Command copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-text-1">CLI &amp; Automated Pipeline Invocation</h3>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border/50 text-xs">
          {COMMAND_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-text-3 hover:text-text-2"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-3">
        Integrate SAMANVAY into NCMRWF operational slurm jobs, crontab, or external disaster decision workflows.
      </p>

      {/* Code Block Container */}
      <div className="relative rounded-xl overflow-hidden border border-border/60 bg-[#070b14]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-surface-2/30 text-xs text-text-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{active.label}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-text-3 hover:text-cyan-300 px-2 py-0.5 rounded border border-border/40 hover:bg-surface-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy command"}</span>
          </button>
        </div>

        <pre className="p-4 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
          {active.cmd}
        </pre>
      </div>
    </GlassCard>
  );
}

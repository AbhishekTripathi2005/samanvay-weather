"use client";

import React, { useRef, useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle, Terminal, Copy, Check, RotateCcw } from "lucide-react";
import { DAG_NODES } from "./PipelineDag";
import type { DagNodeId, DagNodeState } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  runId: string | null;
  progress: number;
  overallStatus: "idle" | "running" | "success" | "fail";
  currentNodeId: DagNodeId | null;
  logs: string[];
  nodeStates: Record<DagNodeId, DagNodeState>;
  onRetry?: () => void;
}

export function LiveExecutionDrawer({
  isOpen,
  onClose,
  runId,
  progress,
  overallStatus,
  currentNodeId,
  logs,
  nodeStates,
  onRetry
}: Props) {
  const [copied, setCopied] = React.useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    toast.success("Logs copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getNodeProgress = (nodeId: DagNodeId): number => {
    const st = nodeStates[nodeId];
    if (st === "success") return 100;
    if (st === "running") return 65;
    if (st === "fail") return 100;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl h-full bg-surface-1 border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              overallStatus === "running" ? "bg-cyan-500/20 text-cyan-400 animate-spin" :
              overallStatus === "fail" ? "bg-rose-500/20 text-rose-400" :
              "bg-emerald-500/20 text-emerald-400"
            }`}>
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-text-1">Live Pipeline Execution</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  overallStatus === "running" ? "bg-cyan-500/20 text-cyan-300" :
                  overallStatus === "fail" ? "bg-rose-500/20 text-rose-300" :
                  overallStatus === "success" ? "bg-emerald-500/20 text-emerald-300" :
                  "bg-surface-2 text-text-3"
                }`}>
                  {overallStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] font-mono text-text-3">
                {runId || "Awaiting execution trigger..."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar & Status */}
        <div className="px-5 py-3.5 bg-surface-2/40 border-b border-border/50">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-text-2">
              {overallStatus === "running" ? "Pipeline in progress..." :
               overallStatus === "fail" ? "Pipeline execution halted" :
               overallStatus === "success" ? "Pipeline execution complete" : "Pipeline Idle"}
            </span>
            <span className="font-mono text-cyan-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                overallStatus === "fail" ? "bg-rose-500" :
                overallStatus === "success" ? "bg-emerald-400" : "bg-gradient-to-r from-cyan-400 to-indigo-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 7 Node Stages Checklist */}
        <div className="px-5 py-3 border-b border-border/50 bg-surface-1">
          <div className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-2">
            DAG Stage Progress
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {DAG_NODES.map((node) => {
              const state = nodeStates[node.id] || "idle";
              const p = getNodeProgress(node.id);

              return (
                <div
                  key={node.id}
                  className={`p-2 rounded-lg border flex flex-col gap-1 transition-all ${
                    state === "running" ? "border-cyan-400 bg-cyan-950/20" :
                    state === "fail" ? "border-rose-500 bg-rose-950/20" :
                    state === "success" ? "border-emerald-500/40 bg-emerald-950/10" :
                    "border-border/40 bg-surface-2/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[11px] text-text-1 truncate">{node.label}</span>
                    {state === "running" && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                    {state === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {state === "fail" && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                    {state === "idle" && <span className="text-[10px] text-text-3 font-mono">--</span>}
                  </div>
                  <div className="w-full h-1 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        state === "fail" ? "bg-rose-500" :
                        state === "success" ? "bg-emerald-400" : "bg-cyan-400"
                      }`}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Terminal Logs View */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#070b14]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-surface-2/20 text-xs">
            <span className="font-mono text-text-3 text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              STDOUT / Real-time Event Stream
            </span>
            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1 text-[11px] text-text-3 hover:text-text-1 transition-colors px-2 py-0.5 rounded border border-border/40 hover:bg-surface-2"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div
            ref={logContainerRef}
            className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1 text-slate-300"
          >
            {logs.length === 0 ? (
              <div className="text-slate-600 italic">Logs will stream here upon pipeline trigger...</div>
            ) : (
              logs.map((log, index) => {
                const isError = log.includes("[FATAL]") || log.includes("[ERROR]") || log.includes("Failure") || log.includes("FAILED");
                const isSuccess = log.includes("[COMPLETE]") || log.includes("successfully");
                const isWarning = log.includes("[WARN]");

                return (
                  <div
                    key={index}
                    className={`${
                      isError ? "text-rose-400 font-semibold bg-rose-950/20 px-1 rounded" :
                      isSuccess ? "text-emerald-400 font-semibold" :
                      isWarning ? "text-amber-400" : "text-slate-300"
                    }`}
                  >
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between bg-surface-1">
          {overallStatus === "fail" && onRetry ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Pipeline</span>
              </button>
              <span className="text-[11px] text-rose-300">Failure recovered via fallback retry.</span>
            </div>
          ) : (
            <span className="text-[11px] text-text-3">
              {overallStatus === "running" ? "Streaming SSE events from server..." : "Execution idle."}
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-2 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

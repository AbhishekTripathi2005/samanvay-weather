"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Dialog } from "@/components/ui/Dialog";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CheckCircle2, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

interface StepLog {
  step: string;
  progress: number;
  message: string;
}

export function RunBlendModal() {
  const { isRunBlendOpen, setIsRunBlendOpen } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [logs, setLogs] = useState<StepLog[]>([]);

  const handleStartRun = async () => {
    setIsRunning(true);
    setCurrentProgress(0);
    setLogs([]);

    try {
      // 1. Trigger POST /api/ops/run
      const res = await fetch("/api/ops/run", { method: "POST" });
      const data = await res.json();
      const runId = data.run_id;

      // 2. Connect to SSE stream
      const eventSource = new EventSource(`/api/ops/run/${runId}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const stepData = JSON.parse(event.data);
          setCurrentProgress(stepData.progress);
          setLogs((prev) => [...prev, { step: stepData.step, progress: stepData.progress, message: stepData.message }]);

          if (stepData.step === "COMPLETE" || stepData.progress >= 100) {
            setIsRunning(false);
            eventSource.close();
            toast.success(`Operational blend ${runId} finished!`);
          }
        } catch (e) {
          console.error("SSE parse error", e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsRunning(false);
      };
    } catch (err: any) {
      toast.error(`Run failed: ${err.message}`);
      setIsRunning(false);
    }
  };

  return (
    <Dialog
      isOpen={isRunBlendOpen}
      onClose={() => setIsRunBlendOpen(false)}
      title="Operational Ingestion & Blending Runner"
      className="max-w-lg"
    >
      <div className="flex flex-col gap-4 py-2 text-xs">
        <p className="text-text-3">
          Trigger live synthetic multi-model ingestion (7 sources), empirical quantile bias correction, synoptic regime detection, and Bayesian Model Averaging.
        </p>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-mono text-[11px] text-text-2">
            <span>Execution Progress</span>
            <span className="text-cyan-400 font-bold">{currentProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-border/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Streaming Logs Box */}
        <div className="h-44 overflow-y-auto rounded-xl p-3 bg-surface-0 border border-border/70 font-mono text-[11px] flex flex-col gap-2">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-text-3 italic">
              Click &apos;Initiate Operational Blend&apos; to trigger cycle
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 animate-fadeUp">
                {log.progress === 100 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <span className="text-cyan-400 font-bold shrink-0">[{log.step}]</span>
                )}
                <span className="text-text-2 leading-tight">{log.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <button
            onClick={() => setIsRunBlendOpen(false)}
            className="px-3 py-1.5 rounded-lg border border-border text-text-2 hover:bg-surface-2 transition-colors"
          >
            Close
          </button>
          <MagneticButton
            onClick={handleStartRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-500 text-surface-0 font-bold hover:bg-cyan-400 disabled:opacity-50 transition-colors"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Blending...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Initiate Operational Blend</span>
              </>
            )}
          </MagneticButton>
        </div>
      </div>
    </Dialog>
  );
}

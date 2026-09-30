"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOpsHistoryQuery, useOpsProductsQuery, useOpsHealthQuery, queryKeys } from "@/lib/queries";
import { postOpsRun } from "@/lib/api";
import { PipelineDag } from "@/components/ops/PipelineDag";
import { LiveExecutionDrawer } from "@/components/ops/LiveExecutionDrawer";
import { RunHistoryTable } from "@/components/ops/RunHistoryTable";
import { SchedulerConfig } from "@/components/ops/SchedulerConfig";
import { ProductsPanel } from "@/components/ops/ProductsPanel";
import { CliSnippet } from "@/components/ops/CliSnippet";
import { HealthPanel } from "@/components/ops/HealthPanel";
import type { DagNodeId, DagNodeState } from "@/lib/types";

const INITIAL_NODE_STATES: Record<DagNodeId, DagNodeState> = {
  ingest: "idle",
  qc: "idle",
  bias_correct: "idle",
  weight_update: "idle",
  blend: "idle",
  verify: "idle",
  publish: "idle"
};

export default function OpsPipelinePage() {
  const queryClient = useQueryClient();

  // Queries
  const { data: historyData } = useOpsHistoryQuery(30);
  const { data: productsData } = useOpsProductsQuery();
  const { data: healthData } = useOpsHealthQuery();

  // Execution state
  const [nodeStates, setNodeStates] = useState<Record<DagNodeId, DagNodeState>>(INITIAL_NODE_STATES);
  const [currentNodeId, setCurrentNodeId] = useState<DagNodeId | null>(null);
  const [overallStatus, setOverallStatus] = useState<"idle" | "running" | "success" | "fail">("idle");
  const [progress, setProgress] = useState(0);
  const [isSimulateFail, setIsSimulateFail] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Run Blend Trigger with SSE Stream
  const handleRunBlend = useCallback(async (forceFail?: boolean) => {
    const shouldFail = forceFail !== undefined ? forceFail : isSimulateFail;

    // Reset states
    setNodeStates(INITIAL_NODE_STATES);
    setCurrentNodeId("ingest");
    setOverallStatus("running");
    setProgress(5);
    setLogs([
      `[${new Date().toISOString().substring(11, 19)}] [INIT] Triggering operational pipeline cycle...`,
      `[${new Date().toISOString().substring(11, 19)}] [CONFIG] Models: 7 NWP & AI | Consensus: Stacking NNLS | Force QC Fail: ${shouldFail}`
    ]);
    setIsDrawerOpen(true);

    try {
      const response = await postOpsRun(shouldFail);
      const runId = response.run_id;
      setCurrentRunId(runId);

      // Invalidate queries so new entry shows in history table
      queryClient.invalidateQueries({ queryKey: queryKeys.opsHistory(30) });

      // Connect to SSE Stream
      const streamUrl = response.stream_url;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const nodeId = data.node_id as DagNodeId | undefined;

          setProgress(data.progress || 0);

          if (nodeId) {
            setCurrentNodeId(nodeId);
            setNodeStates((prev) => ({
              ...prev,
              [nodeId]: data.node_state || "running"
            }));
          }

          if (data.message) {
            setLogs((prev) => [...prev, `[${new Date().toISOString().substring(11, 19)}] [${data.step || "INFO"}] ${data.message}`]);
          }

          // Handle Fail State
          if (data.node_state === "fail" || data.status === "FAILED") {
            setOverallStatus("fail");
            es.close();
            eventSourceRef.current = null;
            toast.error("Pipeline Execution Failed", {
              description: data.message || "Quality Control safety gate failure detected."
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.opsHistory(30) });
            return;
          }

          // Handle Complete State
          if (data.status === "COMPLETE" || data.progress === 100) {
            setOverallStatus("success");
            setCurrentNodeId(null);
            setNodeStates({
              ingest: "success",
              qc: "success",
              bias_correct: "success",
              weight_update: "success",
              blend: "success",
              verify: "success",
              publish: "success"
            });
            es.close();
            eventSourceRef.current = null;
            toast.success("Operational Consensus Complete", {
              description: `Run ${runId} published in ${data.duration_ms || 390}ms.`
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.opsHistory(30) });
          }
        } catch {
          // parse error
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
      };
    } catch (err: unknown) {
      const e = err as Error;
      setOverallStatus("fail");
      toast.error(`Trigger failed: ${e.message}`);
    }
  }, [isSimulateFail, queryClient]);

  const handleReset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setNodeStates(INITIAL_NODE_STATES);
    setCurrentNodeId(null);
    setOverallStatus("idle");
    setProgress(0);
    setCurrentRunId(null);
    setLogs([]);
  }, []);

  const handleRetryFromHistory = useCallback((_runId: string) => {
    // Retry without fail
    setIsSimulateFail(false);
    handleRunBlend(false);
  }, [handleRunBlend]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Animated Pipeline DAG */}
      <PipelineDag
        nodeStates={nodeStates}
        currentNodeId={currentNodeId}
        overallStatus={overallStatus}
        isSimulateFail={isSimulateFail}
        onToggleSimulateFail={setIsSimulateFail}
        onRunBlend={() => handleRunBlend()}
        onOpenLogs={() => setIsDrawerOpen(true)}
        onReset={handleReset}
      />

      {/* 2. Live Logs & Execution Drawer (Modal) */}
      <LiveExecutionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        runId={currentRunId}
        progress={progress}
        overallStatus={overallStatus}
        currentNodeId={currentNodeId}
        logs={logs}
        nodeStates={nodeStates}
        onRetry={() => {
          setIsSimulateFail(false);
          handleRunBlend(false);
        }}
      />

      {/* 3. Run History Table with Retry & Log Viewer */}
      <RunHistoryTable
        runs={historyData?.runs || []}
        onRetry={handleRetryFromHistory}
      />

      {/* 4. Scheduler Config UI (Cron Builder, IST Preview) */}
      <SchedulerConfig />

      {/* 5. Downloadable Operational Products with SHA-256 Checksums */}
      <ProductsPanel products={productsData?.products} />

      {/* 6. CLI & Script Equivalent Snippets */}
      <CliSnippet />

      {/* 7. Forecast Sources Health & Ingestion Latencies Panel */}
      <HealthPanel health={healthData} />
    </div>
  );
}

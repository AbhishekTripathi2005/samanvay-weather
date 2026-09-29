"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCw } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <GlassCard elevation={2} className="p-6 text-center border-red-500/40 font-mono text-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 mb-3">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-red-400">
            {this.props.fallbackTitle || "Render Pipeline Exception"}
          </h4>
          <p className="text-[var(--text-3)] mt-1 max-w-md mx-auto text-[11px]">
            {this.state.error?.message || "An unexpected error occurred in this weather component."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-[var(--text-1)] hover:bg-slate-700"
          >
            <RotateCw className="h-3 w-3" />
            <span>Reset Component</span>
          </button>
        </GlassCard>
      );
    }
    return this.props.children;
  }
}

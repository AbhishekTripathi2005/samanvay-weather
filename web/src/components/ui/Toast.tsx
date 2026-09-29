"use client";

import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (t: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const icons = {
    info: <Info className="h-4 w-4 text-[var(--accent-cyan)]" />,
    success: <CheckCircle2 className="h-4 w-4 text-[var(--alert-green)]" />,
    warning: <AlertTriangle className="h-4 w-4 text-[var(--alert-orange)]" />,
    error: <AlertOctagon className="h-4 w-4 text-[var(--alert-red)]" />,
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-2xl backdrop-blur-xl font-mono text-xs"
          >
            <div className="flex items-start space-x-2">
              <span className="mt-0.5">{icons[t.type]}</span>
              <div>
                <strong className="block text-[var(--text-1)] font-semibold">{t.title}</strong>
                {t.message && <p className="text-[var(--text-2)] text-[11px] mt-0.5">{t.message}</p>}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[var(--text-3)] hover:text-[var(--text-1)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(val: number, decimals: number = 1): string {
  if (val === undefined || val === null || isNaN(val)) return "--";
  return val.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function getAlertBadgeClass(alert: string): { bg: string; text: string; border: string } {
  switch (alert) {
    case "RED":
      return {
        bg: "bg-red-500/15",
        text: "text-red-400",
        border: "border-red-500/40"
      };
    case "ORANGE":
      return {
        bg: "bg-amber-500/15",
        text: "text-amber-400",
        border: "border-amber-500/40"
      };
    case "YELLOW":
      return {
        bg: "bg-yellow-500/15",
        text: "text-yellow-400",
        border: "border-yellow-500/40"
      };
    default:
      return {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/40"
      };
  }
}

export function getViridisColor(val: number, min: number, max: number): string {
  const norm = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
  // Viridis approx interpolation
  if (norm < 0.25) return "#440154";
  if (norm < 0.5) return "#3b528b";
  if (norm < 0.75) return "#21918c";
  if (norm < 0.9) return "#5ec962";
  return "#fde725";
}

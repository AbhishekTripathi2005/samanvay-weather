import { describe, it, expect } from "vitest";
import { cn, formatNumber, getAlertBadgeClass, getViridisColor } from "../src/lib/utils";

describe("SAMANVAY Utilities & Helpers", () => {
  describe("cn (Tailwind class merger)", () => {
    it("merges basic class names", () => {
      expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    });

    it("resolves Tailwind conflicts correctly", () => {
      expect(cn("px-2 text-red-500", "px-4 text-blue-500")).toBe("px-4 text-blue-500");
    });

    it("handles falsy and conditional values", () => {
      const isVisible = false;
      const isActive = true;
      expect(cn("base-class", isVisible && "hidden", isActive && "active")).toBe("base-class active");
    });
  });

  describe("formatNumber", () => {
    it("formats valid numbers with default decimal (1)", () => {
      expect(formatNumber(12.345)).toBe("12.3");
    });

    it("formats with custom decimals", () => {
      expect(formatNumber(12.345, 2)).toBe("12.35");
      expect(formatNumber(1000.5, 0)).toBe("1,001");
      expect(formatNumber(1000.4, 0)).toBe("1,000");
    });

    it("returns '--' for null, undefined, or NaN", () => {
      expect(formatNumber(NaN)).toBe("--");
      expect(formatNumber(undefined as any)).toBe("--");
      expect(formatNumber(null as any)).toBe("--");
    });

    it("respects Indian locale grouping", () => {
      const formatted = formatNumber(100000, 0);
      expect(formatted).toBe("1,00,000");
    });
  });

  describe("getAlertBadgeClass", () => {
    it("returns red styles for RED alert", () => {
      const style = getAlertBadgeClass("RED");
      expect(style.bg).toContain("bg-red-500");
      expect(style.text).toContain("text-red-400");
      expect(style.border).toContain("border-red-500");
    });

    it("returns amber styles for ORANGE alert", () => {
      const style = getAlertBadgeClass("ORANGE");
      expect(style.bg).toContain("bg-amber-500");
      expect(style.text).toContain("text-amber-400");
    });

    it("returns yellow styles for YELLOW alert", () => {
      const style = getAlertBadgeClass("YELLOW");
      expect(style.bg).toContain("bg-yellow-500");
      expect(style.text).toContain("text-yellow-400");
    });

    it("returns emerald styles for default / GREEN alert", () => {
      const style = getAlertBadgeClass("GREEN");
      expect(style.bg).toContain("bg-emerald-500");
      expect(style.text).toContain("text-emerald-400");
    });
  });

  describe("getViridisColor", () => {
    it("returns deep purple for minimum values", () => {
      const color = getViridisColor(0, 0, 100);
      expect(color).toBe("#440154");
    });

    it("returns bright yellow for maximum values", () => {
      const color = getViridisColor(100, 0, 100);
      expect(color).toBe("#fde725");
    });

    it("interpolates intermediate values", () => {
      const colorMid = getViridisColor(50, 0, 100);
      expect(colorMid).toBe("#21918c");
    });

    it("clamps values outside [min, max] range", () => {
      expect(getViridisColor(-50, 0, 100)).toBe("#440154");
      expect(getViridisColor(200, 0, 100)).toBe("#fde725");
    });
  });
});

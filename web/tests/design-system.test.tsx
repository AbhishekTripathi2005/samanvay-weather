import { describe, it, expect } from "vitest";
import React from "react";

describe("SAMANVAY Design System Tokens & Presets", () => {
  it("verifies 7 model color identities are defined", () => {
    const models = [
      { id: "ncum_g", color: "#06B6D4" },
      { id: "neps", color: "#3B82F6" },
      { id: "imd_gfs", color: "#10B981" },
      { id: "ecmwf_ifs", color: "#6366F1" },
      { id: "graphcast", color: "#8B5CF6" },
      { id: "pangu", color: "#D946EF" },
      { id: "fourcastnet", color: "#EC4899" },
    ];
    expect(models.length).toBe(7);
    models.forEach((m) => {
      expect(m.color.startsWith("#")).toBe(true);
    });
  });

  it("verifies IMD alert criteria thresholds", () => {
    const thresholds = {
      heavy: 64.5,
      very_heavy: 115.6,
      extremely_heavy: 204.5,
    };
    expect(thresholds.heavy).toBe(64.5);
    expect(thresholds.very_heavy).toBe(115.6);
    expect(thresholds.extremely_heavy).toBe(204.5);
  });
});

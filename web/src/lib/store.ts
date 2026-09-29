import { create } from "zustand";

interface OpsState {
  variable: string;
  lead: number;
  regime: string;
  season: string;
  selectedRegion: string;
  selectedSource: string;
  theme: "dark" | "light";
  isAutoAdvancing: boolean;
  setVariable: (v: string) => void;
  setLead: (l: number) => void;
  setRegime: (r: string) => void;
  setSeason: (s: string) => void;
  setSelectedRegion: (code: string) => void;
  setSelectedSource: (src: string) => void;
  toggleTheme: () => void;
  setIsAutoAdvancing: (adv: boolean) => void;
  syncFromUrl: (params: URLSearchParams) => void;
}

export const useOpsStore = create<OpsState>((set) => ({
  variable: "rainfall",
  lead: 24,
  regime: "Active monsoon",
  season: "JJAS",
  selectedRegion: "DL",
  selectedSource: "samanvay",
  theme: "dark",
  isAutoAdvancing: false,
  setVariable: (variable) => set({ variable }),
  setLead: (lead) => set({ lead }),
  setRegime: (regime) => set({ regime }),
  setSeason: (season) => set({ season }),
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
  setSelectedSource: (selectedSource) => set({ selectedSource }),
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        }
      }
      return { theme: nextTheme };
    }),
  setIsAutoAdvancing: (isAutoAdvancing) => set({ isAutoAdvancing }),
  syncFromUrl: (params: URLSearchParams) => {
    const variable = params.get("var");
    const lead = params.get("lead");
    const regime = params.get("regime");
    const season = params.get("season");
    const region = params.get("region");
    const source = params.get("source");

    set((state) => ({
      variable: variable || state.variable,
      lead: lead ? parseInt(lead, 10) : state.lead,
      regime: regime || state.regime,
      season: season || state.season,
      selectedRegion: region || state.selectedRegion,
      selectedSource: source || state.selectedSource
    }));
  }
}));

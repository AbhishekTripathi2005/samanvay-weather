// SAMANVAY Global State Management (Zustand)
// MoES / NCMRWF (PS 26081)

import { create } from "zustand";

export const AVAILABLE_LEADS = [24, 48, 72, 96, 120, 144, 168, 192, 216, 240];

export interface FilterState {
  variable: string;
  lead: number;
  region: string;
  season: string;
  regime: string;
  method: string;
}

interface AppState extends FilterState {
  // Navigation & Shell state
  sidebarCollapsed: boolean;
  theme: "dark" | "light";
  
  // Modals & Panels
  isShortcutsOpen: boolean;
  isRunBlendOpen: boolean;
  isAlertsOpen: boolean;
  isMobileNavOpen: boolean;

  selectedRegion: string;
  selectedSource: string;
  isAutoAdvancing: boolean;

  // Actions
  setVariable: (v: string) => void;
  setLead: (l: number) => void;
  stepLead: (direction: -1 | 1) => void;
  setRegion: (r: string) => void;
  setSeason: (s: string) => void;
  setRegime: (r: string) => void;
  setMethod: (m: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;

  setIsShortcutsOpen: (open: boolean) => void;
  setIsRunBlendOpen: (open: boolean) => void;
  setIsAlertsOpen: (open: boolean) => void;
  setIsMobileNavOpen: (open: boolean) => void;

  setSelectedRegion: (code: string) => void;
  setSelectedSource: (src: string) => void;
  setIsAutoAdvancing: (adv: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Defaults
  variable: "rainfall",
  lead: 72,
  region: "DL",
  season: "JJAS",
  regime: "auto",
  method: "adaptive",

  sidebarCollapsed: false,
  theme: "dark",

  isShortcutsOpen: false,
  isRunBlendOpen: false,
  isAlertsOpen: false,
  isMobileNavOpen: false,

  selectedRegion: "DL",
  selectedSource: "samanvay",
  isAutoAdvancing: false,

  setVariable: (variable) => set({ variable }),
  setLead: (lead) => set({ lead }),
  stepLead: (direction) => {
    const currentLead = get().lead;
    const currentIndex = AVAILABLE_LEADS.indexOf(currentLead);
    if (currentIndex === -1) {
      set({ lead: AVAILABLE_LEADS[0] });
      return;
    }
    const nextIndex = Math.max(0, Math.min(AVAILABLE_LEADS.length - 1, currentIndex + direction));
    set({ lead: AVAILABLE_LEADS[nextIndex] });
  },
  setRegion: (region) => set({ region }),
  setSeason: (season) => set({ season }),
  setRegime: (regime) => set({ regime }),
  setMethod: (method) => set({ method }),
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),

  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("samanvay-sidebar-collapsed", JSON.stringify(next));
        } catch {}
      }
      return { sidebarCollapsed: next };
    }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

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
        try {
          localStorage.setItem("samanvay-theme", nextTheme);
        } catch {}
      }
      return { theme: nextTheme };
    }),
  setTheme: (theme) => set({ theme }),

  setIsShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
  setIsRunBlendOpen: (isRunBlendOpen) => set({ isRunBlendOpen }),
  setIsAlertsOpen: (isAlertsOpen) => set({ isAlertsOpen }),
  setIsMobileNavOpen: (isMobileNavOpen) => set({ isMobileNavOpen }),

  setSelectedRegion: (selectedRegion) => set({ selectedRegion, region: selectedRegion }),
  setSelectedSource: (selectedSource) => set({ selectedSource }),
  setIsAutoAdvancing: (isAutoAdvancing) => set({ isAutoAdvancing })
}));

// Backwards compatibility alias
export const useOpsStore = useAppStore;

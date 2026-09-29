"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAppStore, AVAILABLE_LEADS } from "@/lib/store";
import { toast } from "sonner";

export function UrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);

  const {
    variable,
    lead,
    region,
    season,
    regime,
    method,
    setFilters
  } = useAppStore();

  // 1. Initial hydration from URL on mount
  useEffect(() => {
    if (!isInitialized.current && searchParams) {
      const initial: Record<string, any> = {};
      const urlVar = searchParams.get("var");
      const urlLead = searchParams.get("lead");
      const urlRegion = searchParams.get("region");
      const urlSeason = searchParams.get("season");
      const urlRegime = searchParams.get("regime");
      const urlMethod = searchParams.get("method");

      if (urlVar) initial.variable = urlVar;
      if (urlLead) {
        const parsed = parseInt(urlLead, 10);
        if (AVAILABLE_LEADS.includes(parsed)) initial.lead = parsed;
      }
      if (urlRegion) initial.region = urlRegion;
      if (urlSeason) initial.season = urlSeason;
      if (urlRegime) initial.regime = urlRegime;
      if (urlMethod) initial.method = urlMethod;

      if (Object.keys(initial).length > 0) {
        setFilters(initial);
      }
      isInitialized.current = true;
    }
  }, [searchParams, setFilters]);

  // 2. Synchronize store changes to URL search parameters
  useEffect(() => {
    if (!isInitialized.current) return;

    const params = new URLSearchParams();
    params.set("var", variable);
    params.set("lead", lead.toString());
    params.set("region", region);
    params.set("season", season);
    params.set("regime", regime);
    params.set("method", method);

    const newQuery = params.toString();
    const currentQuery = searchParams ? searchParams.toString() : "";

    if (newQuery !== currentQuery) {
      const newUrl = `${pathname}?${newQuery}`;
      // Use replaceState to keep browser history tidy
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [variable, lead, region, season, regime, method, pathname, searchParams]);

  return null;
}

export function copyShareableLink() {
  if (typeof window !== "undefined") {
    navigator.clipboard.writeText(window.location.href).then(
      () => toast.success("Shareable link with active filters copied to clipboard!"),
      () => toast.error("Failed to copy link")
    );
  }
}

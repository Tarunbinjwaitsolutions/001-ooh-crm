"use client";

import { useEffect, useState } from "react";
import { getSite } from "../api";
import { useSites as useCurrentSites } from "./useSites";
import type { Site } from "../types";

export function useSites() {
  const current = useCurrentSites();
  const [search, setSearch] = useState("");

  const sites = current.sites.filter((site) => {
    const value = search.trim().toLowerCase();
    return !value || site.code.toLowerCase().includes(value) || site.city.toLowerCase().includes(value);
  });

  return {
    ...current,
    sites,
    isLoading: current.loading,
    updateFilter: (key: string, value: string) => {
      if (key === "search") setSearch(value);
    },
  };
}

export function useSite(id: string) {
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSite(id)
      .then((result) => {
        if (!cancelled) setSite(result);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Failed to load site");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { site, isLoading, error };
}

export function useSiteCalendar(_id: string, _from: string, _to: string) {
  return { bookings: [], isLoading: false, error: "" };
}

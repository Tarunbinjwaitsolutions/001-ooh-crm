"use client";

import { useEffect, useState } from "react";
import { getVendor } from "../api";
import { useVendors as useCurrentVendors } from "./useVendors";
import type { Vendor } from "../types";

export function useVendors() {
  const current = useCurrentVendors();
  return {
    ...current,
    isLoading: current.loading,
    updateFilter: (key: string, value: string) => {
      if (key === "search") {
        void current.applyFilters({ ...current.filters, search: value });
      }
    },
  };
}

export function useVendor(id: string) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getVendor(id)
      .then((response) => {
        if (!cancelled) setVendor(response.data);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Failed to load vendor");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { vendor, isLoading, error };
}

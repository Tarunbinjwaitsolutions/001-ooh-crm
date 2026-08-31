"use client";

import { useCallback, useEffect, useState } from "react";
import {getSites} from "../api";
import type { Site} from "../types";

export function useSites() {
  const [sites, setSites] =useState<Site[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadSites = useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSites();

        setSites(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load sites"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  return {
    sites,
    loading,
    error,
    loadSites,
  };
}
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createVendor,
  deactivateVendor,
  getVendorSites,
  getVendors,
  updateVendor,
} from "../api";

import type {
  Vendor,
  VendorFormData,
  VendorSite,
} from "../types";

interface VendorFilters {
  search?: string;
  state?: string;
  city?: string;
}

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [filters, setFilters] =
    useState<VendorFilters>({
      search: "",
      state: "",
      city: "",
    });

  /* ----------------------------------
     LOAD VENDORS
  ----------------------------------- */

  const loadVendors = useCallback(
    async (
      nextFilters: VendorFilters = filters,
    ) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getVendors(nextFilters);

        setVendors(
          response.data || [],
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load vendors",
        );
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  /* ----------------------------------
     INITIAL LOAD
  ----------------------------------- */

  useEffect(() => {
    loadVendors({
      search: "",
      state: "",
      city: "",
    });
  }, []);

  /* ----------------------------------
     APPLY FILTERS
  ----------------------------------- */

  const applyFilters = useCallback(
    async (
      nextFilters: VendorFilters,
    ) => {
      setFilters(nextFilters);

      await loadVendors(
        nextFilters,
      );
    },
    [loadVendors],
  );

  /* ----------------------------------
     CLEAR FILTERS
  ----------------------------------- */

  const clearFilters =
    useCallback(async () => {
      const emptyFilters = {
        search: "",
        state: "",
        city: "",
      };

      setFilters(emptyFilters);

      await loadVendors(
        emptyFilters,
      );
    }, [loadVendors]);

  /* ----------------------------------
     ADD VENDOR
  ----------------------------------- */

  async function addVendor(
    data: VendorFormData,
  ) {
    try {
      setSaving(true);
      setError("");

      await createVendor(data);

      await loadVendors(filters);

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create vendor",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------------------
     EDIT VENDOR
  ----------------------------------- */

  async function editVendor(
    id: string,
    data: Partial<VendorFormData>,
  ) {
    try {
      setSaving(true);
      setError("");

      await updateVendor(
        id,
        data,
      );

      await loadVendors(filters);

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update vendor",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------------------
     DEACTIVATE VENDOR
  ----------------------------------- */

  async function deactivate(
    id: string,
  ) {
    try {
      setSaving(true);
      setError("");

      await deactivateVendor(id);

      await loadVendors(filters);

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to deactivate vendor",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------------------
     GET VENDOR SITES
  ----------------------------------- */

  async function getSites(
    id: string,
  ): Promise<VendorSite[]> {
    try {
      setError("");

      const response =
        await getVendorSites(id);

      return response.data || [];
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load sites",
      );

      return [];
    }
  }

  return {
    vendors,
    loading,
    isLoading: loading,
    saving,
    error,

    filters,

    loadVendors,
    applyFilters,
    clearFilters,

    addVendor,
    editVendor,
    deactivate,
    getSites,
    updateFilter: (key: string, value: string) => {
      if (key === "search") {
        void applyFilters({ ...filters, search: value });
      }
    },
  };
}
import type {
  VendorFormData,
  VendorResponse,
  VendorSitesResponse,
  VendorsResponse,
} from "./types";

import { api } from "@/shared/api/client";

export interface VendorFilters {
  search?: string;
  state?: string;
  city?: string;
}

export interface VendorStateFilter {
  state: string;
  vendorCount: number;
  cityCount: number;
  cities: string[];
}

export interface VendorFilterOptionsResponse {
  data: {
    states: VendorStateFilter[];
    cities: string[];
  };
}

/* GET VENDORS */

export async function getVendors(
  filters?: VendorFilters,
): Promise<VendorsResponse> {
  const params = new URLSearchParams();

  if (filters?.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters?.state?.trim()) {
    params.set("state", filters.state.trim());
  }

  if (filters?.city?.trim()) {
    params.set("city", filters.city.trim());
  }

  const query = params.toString();

  return api.get<VendorsResponse>(
    query
      ? `/api/vendors?${query}`
      : "/api/vendors",
  );
}

/* GET STATE + CITY FILTERS */

export async function getVendorFilters(
  state?: string,
): Promise<VendorFilterOptionsResponse> {
  const params = new URLSearchParams();

  if (state?.trim()) {
    params.set("state", state.trim());
  }

  const query = params.toString();

  return api.get<VendorFilterOptionsResponse>(
    query
      ? `/api/vendors/filters?${query}`
      : "/api/vendors/filters",
  );
}

/* GET SINGLE VENDOR */

export async function getVendor(
  id: string,
): Promise<VendorResponse> {
  return api.get<VendorResponse>(
    `/api/vendors/${id}`,
  );
}

/* CREATE VENDOR */

export async function createVendor(
  data: VendorFormData,
): Promise<VendorResponse> {
  return api.post<VendorResponse>(
    "/api/vendors",
    data,
  );
}

/* UPDATE VENDOR */

export async function updateVendor(
  id: string,
  data: Partial<VendorFormData>,
): Promise<VendorResponse> {
  return api.patch<VendorResponse>(
    `/api/vendors/${id}`,
    data,
  );
}

/* DEACTIVATE VENDOR */

export async function deactivateVendor(
  id: string,
): Promise<VendorResponse> {
  return api.patch<VendorResponse>(
    `/api/vendors/${id}/deactivate`,
  );
}

/* GET VENDOR SITES */

export async function getVendorSites(
  id: string,
): Promise<VendorSitesResponse> {
  return api.get<VendorSitesResponse>(
    `/api/vendors/${id}/sites`,
  );
}
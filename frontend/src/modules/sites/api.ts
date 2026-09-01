import { api } from "@/shared/api/client";

import type {
  CreateSiteData,
  Site,
} from "./types";

export async function getSites(): Promise<Site[]> {
  const response = await api.get<{ data: Site[] }>(
    "/api/sites",
  );

  return response.data || [];
}

export async function getSite(
  id: string
) {
  const response = await api.get<{ data: Site }>(
    `/api/sites/${id}`,
  );

  return response.data;
}

export async function createSite(
  data: CreateSiteData
) {
  const response = await api.post<{ data: Site }>(
    "/api/sites",
    data,
  );

  return response.data;
}

export async function updateSite(
  id: string,
  data: Partial<CreateSiteData>
) {
  const response = await api.patch<{ data: Site }>(
    `/api/sites/${id}`,
    data,
  );

  return response.data;
}

export const sitesApi = {
  async getSites(filters?: { vendorId?: string; limit?: string }) {
    const params = new URLSearchParams();
    if (filters?.vendorId) params.set("vendorId", filters.vendorId);
    if (filters?.limit) params.set("limit", filters.limit);
    const query = params.toString();
    return api.get<{ data: Site[] }>(
      query ? `/api/sites?${query}` : "/api/sites",
    );
  },

  async bulkImport(rows: Array<Record<string, unknown>>) {
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => String(row[header] ?? "")).join(","),
      ),
    ].join("\n");

    return api.post<{ imported: number; errors: string[] }>(
      "/api/sites/import",
      { csv },
    );
  },
};
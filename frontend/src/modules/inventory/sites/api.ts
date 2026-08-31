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
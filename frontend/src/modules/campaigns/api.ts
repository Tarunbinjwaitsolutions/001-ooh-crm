import type {
  CampaignFilters,
  CampaignListResponse,
  CampaignResponse,
  CampaignStatus,
  CreateCampaignPayload,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(options?.headers || {}),
        },

        credentials: "include",
      },
    );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Something went wrong",
    );
  }

  return data;
}

function buildQuery(
  filters: CampaignFilters,
): string {
  const params =
    new URLSearchParams();

  if (filters.status) {
    params.set(
      "status",
      filters.status,
    );
  }

  if (filters.city?.trim()) {
    params.set(
      "city",
      filters.city.trim(),
    );
  }

  if (filters.manager?.trim()) {
    params.set(
      "manager",
      filters.manager.trim(),
    );
  }

  if (filters.startDate) {
    params.set(
      "startDate",
      filters.startDate,
    );
  }

  if (filters.endDate) {
    params.set(
      "endDate",
      filters.endDate,
    );
  }

  const query =
    params.toString();

  return query
    ? `?${query}`
    : "";
}

export async function getCampaigns(
  filters: CampaignFilters = {},
): Promise<CampaignListResponse> {
  return request<CampaignListResponse>(
    `/api/campaigns${buildQuery(
      filters,
    )}`,
  );
}

export async function createCampaign(
  payload: CreateCampaignPayload,
): Promise<CampaignResponse> {
  return request<CampaignResponse>(
    "/api/campaigns",
    {
      method: "POST",
      body: JSON.stringify(
        payload,
      ),
    },
  );
}

export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus,
): Promise<CampaignResponse> {
  return request<CampaignResponse>(
    `/api/campaigns/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );
}
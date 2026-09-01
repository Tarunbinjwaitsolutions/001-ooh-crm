import type {
  Task,
  TaskResponse,
  TasksResponse,
  UpdateTaskPayload,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Request failed.",
    );
  }

  return result;
}

export async function getTasks(): Promise<Task[]> {
  const result = await request<TasksResponse>(
    "/tasks",
  );

  return result.data;
}

export async function getCampaignTasks(
  campaignId: string,
): Promise<Task[]> {
  const result =
    await request<TasksResponse>(
      `/campaigns/${campaignId}/tasks`,
    );

  return result.data;
}

export async function updateTask(
  id: string,
  data: UpdateTaskPayload,
): Promise<Task> {
  const result =
    await request<TaskResponse>(
      `/tasks/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

  return result.data;
}
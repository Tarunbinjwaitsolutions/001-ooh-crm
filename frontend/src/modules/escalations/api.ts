import type { Escalation } from "./types";
import { sessionStore } from "@/shared/auth/session-store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function request<T>(
  url: string,
): Promise<T> {
  const token = sessionStore.getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    credentials: "include",
    headers,
    cache: "no-store",
  });

  const result =
    (await response.json()) as
      | ApiResponse<T>
      | { message?: string };

  if (!response.ok) {
    throw new Error(
      "message" in result &&
      result.message
        ? result.message
        : "Something went wrong",
    );
  }

  if (
    "success" in result &&
    result.success === false
  ) {
    throw new Error("Request failed");
  }

  if ("data" in result) {
    return result.data;
  }

  return result as T;
}

export async function getEscalations(): Promise<
  Escalation[]
> {
  return request<Escalation[]>(
    `${API_URL}/escalations`,
  );
}

export async function getTaskEscalations(
  taskId: string,
): Promise<Escalation[]> {
  return request<Escalation[]>(
    `${API_URL}/tasks/${taskId}/escalations`,
  );
}
import type { Task, TaskStatus } from "./types";

export function getTaskName(
  value:
    | string
    | { _id: string; name?: string }
    | null
    | undefined,
) {
  if (!value) return "—";

  return typeof value === "string"
    ? value
    : value.name || value._id;
}

export function getTaskStatus(
  task: Task,
): TaskStatus {
  if (
    task.status !== "Completed" &&
    new Date(task.deadline) < new Date()
  ) {
    return "Overdue";
  }

  return task.status;
}

export function formatTaskDate(
  date: string,
) {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export function formatTaskTime(
  date: string,
) {
  return new Date(date).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function formatTaskStatus(
  status: TaskStatus,
) {
  return status === "InProgress"
    ? "In Progress"
    : status;
}
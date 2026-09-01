"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getTasks,
  getCampaignTasks,
  updateTask,
} from "../api";

import type {
  Task,
  UpdateTaskPayload,
} from "../types";

export function useTask(
  campaignId?: string,
) {
  const [tasks, setTasks] = useState<Task[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadTasks = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const data = campaignId
          ? await getCampaignTasks(
              campaignId,
            )
          : await getTasks();

        setTasks(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load tasks.",
        );
      } finally {
        setLoading(false);
      }
    },
    [campaignId],
  );

  const changeTask = async (
    id: string,
    data: UpdateTaskPayload,
  ) => {
    try {
      setUpdating(true);
      setError("");

      await updateTask(id, data);
      await loadTasks();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task.",
      );
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    updating,
    error,
    loadTasks,
    changeTask,
  };
}
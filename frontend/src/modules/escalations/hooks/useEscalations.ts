"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getEscalations,
  getTaskEscalations,
} from "../api";

import type { Escalation } from "../types";

export function useEscalations() {
  const [
    escalations,
    setEscalations,
  ] = useState<Escalation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadEscalations =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getEscalations();

        setEscalations(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load escalations",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadEscalations();
  }, [loadEscalations]);

  return {
    escalations,
    loading,
    error,
    reload: loadEscalations,
  };
}

export function useTaskEscalations(
  taskId: string | null,
) {
  const [
    escalations,
    setEscalations,
  ] = useState<Escalation[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!taskId) {
      setEscalations([]);
      return;
    }

    // taskId is confirmed to be a string here
    const id = taskId;

    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getTaskEscalations(id);

        if (active) {
          setEscalations(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load task escalations",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [taskId]);

  return {
    escalations,
    loading,
    error,
  };
}
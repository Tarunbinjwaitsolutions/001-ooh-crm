'use client';

import { useCallback, useEffect, useState } from 'react';

import { toErrorMessage } from '@/shared/api/errors';

import { employeesApi } from '../api';
import type { EmployeeListQuery, EmployeeListResponse, ManagerOption } from '../types';

/**
 * REFERENCE MODULE — data hooks.
 *
 * Each hook owns the three states every screen needs: loading, error, data.
 * A screen that only handles the happy path fails the Definition of Done.
 */

export function useEmployeeList(query: EmployeeListQuery) {
  const [data, setData] = useState<EmployeeListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  // Serialised so the effect re-runs on a value change, not on a new object identity.
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await employeesApi.list(JSON.parse(queryKey) as EmployeeListQuery);
        if (cancelled) return;
        setData(response);
      } catch (err) {
        if (cancelled) return;
        setError(toErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [queryKey, reloadToken]);

  return { data, isLoading, error, reload };
}

/** Options for the "reports to" dropdown. */
export function useManagerOptions(enabled = true) {
  const [options, setOptions] = useState<ManagerOption[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    employeesApi
      .managerOptions()
      .then((result) => {
        if (!cancelled) setOptions(result);
      })
      // A failed dropdown must not break the form — it degrades to "no manager".
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Derived rather than stored, so the disabled case needs no setState in an effect.
  return { options, isLoading: enabled && isFetching };
}

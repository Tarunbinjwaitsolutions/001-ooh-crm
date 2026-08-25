import { useState, useEffect, useCallback, useRef } from 'react';
import { leadsApi } from '../api';
import { Lead, LeadFilters, LeadsListResponse } from '../types';

export function useLeads(filters?: LeadFilters, pollIntervalMs?: number) {
  const [data, setData] = useState<LeadsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const filtersRef = useRef(filters);

  // Keep filtersRef up to date without triggering effect rerenders on object reference change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchLeads = useCallback(async () => {
    try {
      if (!data) setIsLoading(true);
      const res = await leadsApi.getLeads(filtersRef.current);
      setData(res);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [data]); // Removed filters from dependencies to avoid object reference issues

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLeads();

    if (pollIntervalMs) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      const intervalId = setInterval(() => { void fetchLeads(); }, pollIntervalMs);
      return () => clearInterval(intervalId);
    }
  }, [fetchLeads, pollIntervalMs]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchLeads,
  };
}

export function useLead(id: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLead = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await leadsApi.getLead(id);
      setLead(res);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLead();
  }, [fetchLead]);

  return {
    lead,
    isLoading,
    error,
    mutate: fetchLead,
  };
}

import { useState, useCallback, useEffect } from 'react';
import { sitesApi } from '../api';
import type { Site, Booking } from '../types';
import { ApiError } from '../../../shared/api/errors';

export function useSites(initialFilters?: Record<string, string>) {
  const [sites, setSites] = useState<Site[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || { page: '1', limit: '25' });

  const fetchSites = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await sitesApi.getSites(filters);
      setSites(res.data);
      setTotal(res.meta.total);
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load sites');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSites();
  }, [fetchSites]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: '1' }));
  };

  return { sites, total, isLoading, error, filters, updateFilter, mutate: fetchSites };
}

export function useSite(id: string) {
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSite = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await sitesApi.getSite(id);
      setSite(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load site');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSite();
  }, [fetchSite]);

  return { site, isLoading, error, mutate: fetchSite };
}

export function useSiteCalendar(id: string, fromDate: string, toDate: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    if (!id || !fromDate || !toDate) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await sitesApi.getSiteCalendar(id, fromDate, toDate);
      setBookings(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load calendar');
    } finally {
      setIsLoading(false);
    }
  }, [id, fromDate, toDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCalendar();
  }, [fetchCalendar]);

  return { bookings, isLoading, error, mutate: fetchCalendar };
}

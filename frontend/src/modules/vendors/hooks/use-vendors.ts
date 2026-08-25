import { useState, useCallback, useEffect } from 'react';
import { vendorsApi } from '../api';
import type { Vendor } from '../types';
import { ApiError } from '../../../shared/api/errors';

export function useVendors(initialFilters?: Record<string, string>) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || { page: '1', limit: '25' });

  const fetchVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await vendorsApi.getVendors(filters);
      setVendors(res.data);
      setTotal(res.meta.total);
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchVendors();
  }, [fetchVendors]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: '1' }));
  };

  return { vendors, total, isLoading, error, filters, updateFilter, mutate: fetchVendors };
}

export function useVendor(id: string) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendor = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await vendorsApi.getVendor(id);
      setVendor(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load vendor');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchVendor();
  }, [fetchVendor]);

  return { vendor, isLoading, error, mutate: fetchVendor };
}

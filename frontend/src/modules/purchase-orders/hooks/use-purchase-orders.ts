import { useState, useCallback, useEffect } from 'react';
import { purchaseOrdersApi } from '../api';
import type { PurchaseOrder } from '../types';
import { ApiError } from '../../../shared/api/errors';

export function usePurchaseOrders(initialFilters?: Record<string, string>) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || { page: '1', limit: '25' });

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await purchaseOrdersApi.getPurchaseOrders(filters);
      setPurchaseOrders(res.data);
      setTotal(res.meta.total);
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load purchase orders');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: '1' }));
  };

  return { purchaseOrders, total, isLoading, error, filters, updateFilter, mutate: fetchPurchaseOrders };
}

export function usePurchaseOrder(id: string) {
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrder = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await purchaseOrdersApi.getPurchaseOrder(id);
      setPurchaseOrder(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load purchase order');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPurchaseOrder();
  }, [fetchPurchaseOrder]);

  return { purchaseOrder, isLoading, error, mutate: fetchPurchaseOrder };
}

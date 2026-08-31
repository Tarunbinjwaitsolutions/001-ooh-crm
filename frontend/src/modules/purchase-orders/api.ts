import { api as client } from '../../shared/api/client';
import type { PurchaseOrder, PurchaseOrdersResponse, POStatus } from './types';

export const purchaseOrdersApi = {
  getPurchaseOrders: async (params?: Record<string, string>): Promise<PurchaseOrdersResponse> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return client.get<PurchaseOrdersResponse>('/api/purchase-orders' + qs);
  },

  getPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    return client.get<PurchaseOrder>(`/api/purchase-orders/${id}`);
  },

  createPurchaseOrder: async (data: any): Promise<PurchaseOrder> => {
    return client.post<PurchaseOrder>('/api/purchase-orders', data);
  },

  updateStatus: async (id: string, status: POStatus): Promise<PurchaseOrder> => {
    return client.patch<PurchaseOrder>(`/api/purchase-orders/${id}/status`, { status });
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    const res = await fetch(`http://localhost:5000/api/purchase-orders/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    if (!res.ok) throw new Error('Failed to download PDF');
    return res.blob();
  },
};

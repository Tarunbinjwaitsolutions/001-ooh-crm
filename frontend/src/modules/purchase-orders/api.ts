import { api } from "@/shared/api/client";
import type {
  PurchaseOrderFormData,
  PurchaseOrderResponse,
  PurchaseOrdersResponse,
} from "./types";

export async function getPurchaseOrders() {
  return api.get<PurchaseOrdersResponse>(
    "/api/purchase-orders",
  );
}

export async function getPurchaseOrder(
  id: string,
) {
  return api.get<PurchaseOrderResponse>(
    `/api/purchase-orders/${id}`,
  );
}

export async function createPurchaseOrder(
  data: PurchaseOrderFormData,
) {
  return api.post<PurchaseOrderResponse>(
    "/api/purchase-orders",
    data,
  );
}

export async function updatePurchaseOrder(
  id: string,
  data: Partial<PurchaseOrderFormData>,
) {
  return api.patch<PurchaseOrderResponse>(
    `/api/purchase-orders/${id}`,
    data,
  );
}

export async function issuePurchaseOrder(
  id: string,
) {
  return api.post<PurchaseOrderResponse>(
    `/api/purchase-orders/${id}/issue`,
  );
}

export async function cancelPurchaseOrder(
  id: string,
) {
  return api.post<PurchaseOrderResponse>(
    `/api/purchase-orders/${id}/cancel`,
  );
}

export const purchaseOrdersApi = {
  list: getPurchaseOrders,
  get: getPurchaseOrder,
  create: createPurchaseOrder,
  update: updatePurchaseOrder,
  issue: issuePurchaseOrder,
  cancel: cancelPurchaseOrder,
  updateStatus: async (id: string, status: 'Issued' | 'Accepted' | 'Cancelled') => {
    if (status === 'Issued') return issuePurchaseOrder(id);
    if (status === 'Cancelled') return cancelPurchaseOrder(id);
    return updatePurchaseOrder(id, { status } as any);
  },
  downloadPDF: async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('mo.accessToken') : '';
    const res = await fetch(`/api/purchase-orders/${id}/pdf`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!res.ok) throw new Error('Failed to download PO PDF');
    return res.blob();
  },
};
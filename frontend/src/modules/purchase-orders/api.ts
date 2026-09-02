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
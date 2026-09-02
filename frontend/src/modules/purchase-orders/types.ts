export type PurchaseOrderStatus =
  | "Draft"
  | "Issued"
  | "Accepted"
  | "Cancelled";

export interface PurchaseOrderLineItem {
  _id?: string;
  siteId: string;
  from: string;
  to: string;
  negotiatedRatePerDay: number;
  days: number;
  amount: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  campaignId:
    | string
    | { _id: string; name: string };
  vendorId:
    | string
    | {
        _id: string;
        name: string;
        state?: string;
        city?: string;
      };
  lineItems: PurchaseOrderLineItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  issuedAt?: string;
  pdfKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderFormData {
  campaignId: string;
  vendorId: string;
  lineItems: Omit<
    PurchaseOrderLineItem,
    "amount" | "days"
  >[];
}

export interface PurchaseOrdersResponse {
  data: PurchaseOrder[];
  message?: string;
}

export interface PurchaseOrderResponse {
  data: PurchaseOrder;
  message?: string;
}
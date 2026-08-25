import type { Vendor } from '../vendors/types';
import type { Site } from '../sites/types';

export type POStatus = 'Draft' | 'Issued' | 'Accepted' | 'Cancelled';

export interface PurchaseOrderSite {
  siteId: string | Site;
  negotiatedRate: number;
  _id?: string;
}

export interface PurchaseOrder {
  id: string;
  _id: string;
  poNumber: string;
  campaignId: { _id: string, name: string } | string;
  vendorId: Vendor | string;
  sites: PurchaseOrderSite[];
  totalAmount: number;
  status: POStatus;
  startDate: string;
  endDate: string;
  issuedDate?: string;
  createdAt: string;
}

export interface PurchaseOrdersResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

import type { Vendor } from '../vendors/types';

export type SiteType = 'Airport' | 'Highway' | 'Mall' | 'Metro' | 'Market' | 'Other';
export type SiteStatus = 'Active' | 'Maintenance' | 'Inactive';

export interface Site {
  id: string;
  _id: string;
  siteCode: string;
  city: string;
  type: SiteType;
  address: string;
  gps?: string;
  width?: number;
  height?: number;
  baseCostPerDay: number;
  vendorId: string | Vendor; // Populated in list/get
  status: SiteStatus;
  photos: string[];
  createdAt: string;
}

export interface SitesResponse {
  data: Site[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface Booking {
  poNumber: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  status: string;
}

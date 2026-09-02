export type SiteType =
  | "Airport"
  | "Highway"
  | "Mall"
  | "Metro"
  | "Market"
  | "Other";

export type SiteStatus =
  | "Active"
  | "Maintenance"
  | "Inactive";

export type SiteAvailability =
  | "Available"
  | "Booked";

export interface Site {
  _id: string;
  id?: string;
  code: string;
  siteCode?: string;
  city: string;
  type: SiteType;
  address?: string;

  gps: {
    lat: number;
    lng: number;
  };

  sizeWidth: number;
  sizeHeight: number;
  width?: number;
  height?: number;
  baseCostPerDay: number;

  vendorId?: string | null;

  status: SiteStatus;
  availability?: SiteAvailability;
  photos: string[];
}

export interface CreateSiteData {
  city: string;
  type: SiteType;
  address?: string;

  gps: {
    lat: number;
    lng: number;
  };

  sizeWidth: number;
  sizeHeight: number;
  baseCostPerDay: number;

  vendorId?: string | null;
  status?: SiteStatus;
  photos?: string[];
}
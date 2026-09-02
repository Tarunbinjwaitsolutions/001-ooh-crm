export interface AvailableSite {
  _id: string;
  code: string;
  city: string;
  type: string;
  address?: string;

  gps?: {
    lat: number;
    lng: number;
  };

  sizeWidth: number;
  sizeHeight: number;
  baseCostPerDay: number;

  status: string;

  vendorId?: {
    _id: string;
    name: string;
    city?: string;
  } | null;
}

export interface Booking {
  _id: string;

  siteId: string;

  campaignId: string;

  quotationId?: string;

  date: string;

  createdAt?: string;
}

export interface BookingPayload {
  siteId: string;
  campaignId: string;
  quotationId?: string;
  from: string;
  to: string;
}
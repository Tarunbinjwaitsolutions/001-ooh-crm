export type VendorStatus = 'Active' | 'Inactive' | 'Blacklisted';

export interface Vendor {
  id: string;
  _id: string; // Mongoose backwards compatibility
  name: string;
  city: string;
  siteOwnerName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  address: string;
  gstNumber?: string;
  paymentTerms?: string;
  bankAccount?: string; // conditionally present
  ifscCode?: string; // conditionally present
  status: VendorStatus;
  createdAt: string;
}

export interface VendorsResponse {
  data: Vendor[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

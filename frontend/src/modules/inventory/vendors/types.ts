export type VendorStatus =
  | "Active"
  | "Inactive";

/* ----------------------------------
   VENDOR
----------------------------------- */

export interface Vendor {
  _id: string;

  name: string;

  state: string;

  city: string;

  contactPerson?: string;

  mobile?: string;

  email?: string;

  address?: string;

  panNumber?: string;

  msmeNumber?: string;

  gstNumber?: string;

  paymentTerms?: string;

  bankAccountNumber?: string;

  ifsc?: string;

  status: VendorStatus;

  createdAt?: string;

  updatedAt?: string;
}

/* ----------------------------------
   VENDOR SITE
----------------------------------- */

export interface VendorSite {
  _id: string;

  code: string;

  city: string;

  type: string;

  status: string;
}

/* ----------------------------------
   VENDOR FORM
----------------------------------- */

export interface VendorFormData {
  name: string;

  state: string;

  city: string;

  contactPerson: string;

  mobile: string;

  email: string;

  address: string;

  panNumber: string;

  msmeNumber: string;

  gstNumber: string;

  paymentTerms: string;

  bankAccountNumber: string;

  ifsc: string;

  status: VendorStatus;
}

/* ----------------------------------
   VENDOR LIST RESPONSE
----------------------------------- */

export interface VendorsResponse {
  data: Vendor[];

  message?: string;

  success?: boolean;
}

/* ----------------------------------
   SINGLE VENDOR RESPONSE
----------------------------------- */

export interface VendorResponse {
  data: Vendor;

  message?: string;

  success?: boolean;
}

/* ----------------------------------
   VENDOR SITES RESPONSE
----------------------------------- */

export interface VendorSitesResponse {
  data: VendorSite[];

  message?: string;

  success?: boolean;
}
import type {
  Vendor,
  VendorFormData,
} from "./types";

/* ----------------------------------
   EMPTY VENDOR FORM
----------------------------------- */

export function getEmptyVendorForm(): VendorFormData {
  return {
    name: "",

    state: "",

    city: "",

    contactPerson: "",

    mobile: "",

    email: "",

    address: "",

    panNumber: "",

    msmeNumber: "",

    gstNumber: "",

    paymentTerms: "",

    bankAccountNumber: "",

    ifsc: "",

    status: "Active",
  };
}

/* ----------------------------------
   VENDOR → FORM
----------------------------------- */

export function vendorToForm(
  vendor: Vendor,
): VendorFormData {
  return {
    name: vendor.name || "",

    state: vendor.state || "",

    city: vendor.city || "",

    contactPerson:
      vendor.contactPerson || "",

    mobile: vendor.mobile || "",

    email: vendor.email || "",

    address: vendor.address || "",

    panNumber:
      vendor.panNumber || "",

    msmeNumber:
      vendor.msmeNumber || "",

    gstNumber:
      vendor.gstNumber || "",

    paymentTerms:
      vendor.paymentTerms || "",

    bankAccountNumber:
      vendor.bankAccountNumber || "",

    ifsc: vendor.ifsc || "",

    status:
      vendor.status || "Active",
  };
}

/* ----------------------------------
   GENERIC VALUE
----------------------------------- */

export function formatValue(
  value?: string,
): string {
  return value?.trim() || "—";
}

/* ----------------------------------
   GST
----------------------------------- */

export function formatGST(
  value?: string,
): string {
  return (
    value?.trim().toUpperCase() || "—"
  );
}

/* ----------------------------------
   PAN
----------------------------------- */

export function formatPAN(
  value?: string,
): string {
  return (
    value?.trim().toUpperCase() || "—"
  );
}

/* ----------------------------------
   MSME
----------------------------------- */

export function formatMSME(
  value?: string,
): string {
  return (
    value?.trim().toUpperCase() || "—"
  );
}
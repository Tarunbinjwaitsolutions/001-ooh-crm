"use client";

import type { Vendor } from "../types";

import {
  formatGST,
  formatMSME,
  formatPAN,
  formatValue,
} from "../format";

interface Props {
  vendor: Vendor;
  onClose: () => void;
  onEdit: () => void;
}

export default function VendorDetails({
  vendor,
  onClose,
  onEdit,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">

        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EEEEF3] bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937]">
              Vendor Details
            </h2>

            <p className="mt-1 text-sm text-[#667085]">
              {vendor.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              rounded-lg
              px-3 py-1
              text-2xl
              font-bold
              text-gray-500
              transition
              hover:bg-[#F9DADA]
              hover:text-[#8B2424]
              focus:outline-none
              focus:ring-2
              focus:ring-[#F9DADA]
            "
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-6">

            {/* BASIC INFORMATION */}
            <Section title="Basic Information">
              <Item
                label="Vendor Name"
                value={vendor.name}
              />

              <Item
                label="State"
                value={vendor.state}
              />

              <Item
                label="City"
                value={vendor.city}
              />

              <Item
                label="Status"
                value={vendor.status}
              />
            </Section>

            {/* CONTACT INFORMATION */}
            <Section title="Contact Information">
              <Item
                label="Contact Person"
                value={vendor.contactPerson}
              />

              <Item
                label="Mobile"
                value={vendor.mobile}
              />

              <Item
                label="Email"
                value={vendor.email}
              />

              <Item
                label="Address"
                value={vendor.address}
              />
            </Section>

            {/* BUSINESS DOCUMENTS */}
            <Section title="Business Documents">
              <Item
                label="PAN Number"
                value={formatPAN(
                  vendor.panNumber,
                )}
              />

              <Item
                label="MSME Number"
                value={formatMSME(
                  vendor.msmeNumber,
                )}
              />

              <Item
                label="GST Number"
                value={formatGST(
                  vendor.gstNumber,
                )}
              />
            </Section>

            {/* PAYMENT */}
            <Section title="Payment Information">
              <Item
                label="Payment Terms"
                value={vendor.paymentTerms}
              />
            </Section>

            {/* BANK DETAILS */}
            <Section title="Bank Details">
              <Item
                label="Account Number"
                value={
                  vendor.bankAccountNumber
                }
              />

              <Item
                label="IFSC"
                value={vendor.ifsc}
              />
            </Section>

          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-[#EEEEF3] bg-[#FAFAFB] p-5">
          <button
            type="button"
            onClick={onEdit}
            className="
              w-full
              rounded-xl
              bg-[#8B2424]
              px-5 py-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[#A8383B]
              focus:outline-none
              focus:ring-2
              focus:ring-[#F9DADA]
              focus:ring-offset-2
            "
          >
            Edit Vendor
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SECTION
========================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border border-[#E8E8EC]
        bg-white
        p-5
        shadow-sm
      "
    >
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#1F2937]">
        <span className="h-5 w-1 rounded-full bg-[#8B2424]" />
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

/* =========================
   ITEM
========================= */

function Item({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div
      className="
        rounded-lg
        border border-transparent
        p-2
        transition
        hover:border-[#F0C7C7]
        hover:bg-[#FFF8F8]
      "
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#1F2937]">
        {formatValue(value)}
      </p>
    </div>
  );
}
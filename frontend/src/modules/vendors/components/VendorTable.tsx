"use client";

import type { Vendor, VendorSite } from "../types";

import {
  formatGST,
  formatMSME,
  formatPAN,
  formatValue,
} from "../format";

interface Props {
  vendors: Vendor[];
  onView: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  onSites: (vendor: Vendor) => void;
  onDeactivate: (vendor: Vendor) => void;
}

export default function VendorTable({
  vendors,
  onView,
  onEdit,
  onSites,
  onDeactivate,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8E8EC] bg-white shadow-sm">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between border-b border-[#EEEEF3] px-5 py-5">
        <div>
          <h2 className="text-lg font-bold text-[#1F2937]">
            Vendor List
          </h2>

          <p className="mt-1 text-sm text-[#667085]">
            {vendors.length}{" "}
            {vendors.length === 1
              ? "vendor"
              : "vendors"}{" "}
            found
          </p>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-x-auto">
        <table className="min-w-[1400px] w-full">

          {/* TABLE HEADER */}

          <thead className="bg-[#F8F8FA]">
            <tr>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#667085]">
                Vendor
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#667085]">
                State
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#667085]">
                City
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#667085]">
                Contact
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#667085]">
                PAN
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#667085]">
                MSME
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#667085]">
                GST
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#667085]">
                Status
              </th>

              <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#667085]">
                Actions
              </th>

            </tr>
          </thead>

          {/* TABLE BODY */}

          <tbody className="divide-y divide-[#EEEEF3]">

            {vendors.map((vendor) => (
              <tr
                key={vendor._id}
                className="transition-colors hover:bg-[#FFF8F8]"
              >

                {/* ================= VENDOR ================= */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#F9DADA]
                        font-bold
                        text-[#8B2424]
                      "
                    >
                      {vendor.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#1F2937]">
                        {vendor.name}
                      </p>
                    </div>

                  </div>
                </td>

                {/* ================= STATE ================= */}

                <td className="px-5 py-4">
                  <span className="text-sm font-medium text-[#475467]">
                    {formatValue(
                      vendor.state,
                    )}
                  </span>
                </td>

                {/* ================= CITY ================= */}

                <td className="px-5 py-4">
                  <span className="text-sm font-medium text-[#475467]">
                    {formatValue(
                      vendor.city,
                    )}
                  </span>
                </td>

                {/* ================= CONTACT ================= */}

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-[#344054]">
                    {formatValue(
                      vendor.contactPerson,
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-[#667085]">
                    {formatValue(
                      vendor.mobile,
                    )}
                  </p>
                </td>

                {/* ================= PAN ================= */}

                <td className="px-5 py-4">
                  <span className="font-mono text-xs font-medium text-[#475467]">
                    {formatPAN(
                      vendor.panNumber,
                    )}
                  </span>
                </td>

                {/* ================= MSME ================= */}

                <td className="px-5 py-4">
                  <span className="font-mono text-xs font-medium text-[#475467]">
                    {formatMSME(
                      vendor.msmeNumber,
                    )}
                  </span>
                </td>

                {/* ================= GST ================= */}

                <td className="px-5 py-4">
                  <span className="font-mono text-xs font-medium text-[#475467]">
                    {formatGST(
                      vendor.gstNumber,
                    )}
                  </span>
                </td>

                {/* ================= STATUS ================= */}

                <td className="px-5 py-4">
                  <StatusBadge
                    status={vendor.status}
                  />
                </td>

                {/* ================= ACTIONS ================= */}

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">

                    {/* VIEW */}

                    <button
                      type="button"
                      onClick={() =>
                        onView(vendor)
                      }
                      className="
                        rounded-lg
                        border border-gray-300
                        bg-white
                        px-3 py-2
                        text-xs
                        font-bold
                        text-[#475467]
                        transition
                        hover:border-[#8B2424]
                        hover:bg-[#F9DADA]
                        hover:text-[#8B2424]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#F9DADA]
                      "
                    >
                      View
                    </button>

                    {/* SITES */}

                    <button
                      type="button"
                      onClick={() =>
                        onSites(vendor)
                      }
                      className="
                        rounded-lg
                        bg-[#F9DADA]
                        px-3 py-2
                        text-xs
                        font-bold
                        text-[#8B2424]
                        transition
                        hover:bg-[#8B2424]
                        hover:text-white
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#F9DADA]
                      "
                    >
                      Sites
                    </button>

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() =>
                        onEdit(vendor)
                      }
                      className="
                        rounded-lg
                        border border-gray-300
                        bg-white
                        px-3 py-2
                        text-xs
                        font-bold
                        text-[#475467]
                        transition
                        hover:border-[#8B2424]
                        hover:bg-[#F9DADA]
                        hover:text-[#8B2424]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#F9DADA]
                      "
                    >
                      Edit
                    </button>

                    {/* DEACTIVATE */}

                    {vendor.status ===
                      "Active" && (
                      <button
                        type="button"
                        onClick={() =>
                          onDeactivate(
                            vendor,
                          )
                        }
                        className="
                          rounded-lg
                          bg-red-50
                          px-3 py-2
                          text-xs
                          font-bold
                          text-red-700
                          transition
                          hover:bg-red-700
                          hover:text-white
                          focus:outline-none
                          focus:ring-2
                          focus:ring-red-100
                        "
                      >
                        Deactivate
                      </button>
                    )}

                  </div>
                </td>

              </tr>
            ))}

            {/* ================= EMPTY STATE ================= */}

            {vendors.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-16 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F9DADA]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#8B2424"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  </div>

                  <p className="mt-4 font-bold text-[#1F2937]">
                    No vendors found
                  </p>

                  <p className="mt-1 text-sm text-[#667085]">
                    Add a vendor to get
                    started.
                  </p>
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({
  status,
}: {
  status:
    | "Active"
    | "Inactive";
}) {
  return status === "Active" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 ring-1 ring-inset ring-gray-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Inactive
    </span>
  );
}
"use client";

import type { Site } from "../types";

import { formatCost } from "../format";

interface Props {
  sites: Site[];
  onEdit: (site: Site) => void;
}

export default function SiteTable({
  sites,
  onEdit,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Sites
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {sites.length}{" "}
            {sites.length === 1
              ? "site"
              : "sites"}{" "}
            found
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Code
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                City
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Type
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Address
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Size
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Cost / Day
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                Status
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sites.map((site) => (
              <tr
                key={site._id}
                className="transition-colors hover:bg-gray-50"
              >
                {/* Code */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="font-semibold text-gray-900">
                    {site.code}
                  </span>
                </td>

                {/* City */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="text-sm text-gray-700">
                    {site.city}
                  </span>
                </td>

                {/* Type */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="rounded-md bg-[#F9DADA] px-2.5 py-1 text-xs font-medium text-[#8B2424]">
                    {site.type}
                  </span>
                </td>

                {/* Address */}
                <td className="max-w-[220px] px-5 py-4">
                  <span
                    className="block truncate text-sm text-gray-600"
                    title={site.address || "—"}
                  >
                    {site.address || "—"}
                  </span>
                </td>

                {/* Size */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="text-sm text-gray-700">
                    {site.sizeWidth} ×{" "}
                    {site.sizeHeight}
                  </span>
                </td>

                {/* Cost */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCost(
                      site.baseCostPerDay
                    )}
                  </span>
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-5 py-4">
                  <StatusBadge
                    status={site.status}
                  />
                </td>

                {/* Action */}
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(site)
                    }
                    className="rounded-lg border border-[#8B2424] bg-[#8B2424] px-3.5 py-2 text-sm font-medium text-[#F9DADA] transition hover:border-[#8B2424] hover:bg-[#8B2424]"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {sites.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-16 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F9DADA]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6 text-[#8B2424]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-gray-900">
                    No sites found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Add a site to see it here.
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

/* Status Badge */

function StatusBadge({
  status,
}: {
  status: Site["status"];
}) {
  const styles = {
    Active:
      "bg-[#F9DADA] text-[#8B2424] ring-[#8B2424]/20",

    Maintenance:
      "bg-[#F9DADA] text-[#A8333B] ring-[#A8333B]/20",

    Inactive:
      "bg-gray-100 text-gray-600 ring-gray-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        styles[status]
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Active"
            ? "bg-[#8B2424]"
            : status === "Maintenance"
              ? "bg-[#A8333B]"
              : "bg-gray-400"
        }`}
      />

      {status}
    </span>
  );
}
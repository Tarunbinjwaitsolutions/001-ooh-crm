"use client";

import type { AvailableSite } from "../types";

import { formatCost } from "../format";

interface Props {
  sites: AvailableSite[];
  onBook: (
    site: AvailableSite
  ) => void;
}

export default function AvailabilityTable({
  sites,
  onBook,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900">
          Available Sites
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          {sites.length} available{" "}
          {sites.length === 1
            ? "site"
            : "sites"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-700">
                Code
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-700">
                City
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-700">
                Type
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-700">
                Size
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-700">
                Cost / Day
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sites.map((site) => (
              <tr
                key={site._id}
                className="hover:bg-gray-50"
              >
                <td className="px-5 py-4 text-sm font-bold text-gray-900">
                  {site.code}
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {site.city}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-md bg-[#F9DADA] px-3 py-1 text-xs font-semibold text-[#8B2424]">
                    {site.type}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {site.sizeWidth} ×{" "}
                  {site.sizeHeight}
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                  {formatCost(
                    site.baseCostPerDay
                  )}
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      onBook(site)
                    }
                    className="rounded-lg bg-[#8B2424] px-4 py-2 text-sm font-semibold text-[#F9DADA] transition hover:bg-[#A8383B] focus:outline-none focus:ring-2 focus:ring-[#F9DADA] focus:ring-offset-2"
                  >
                    Book Site
                  </button>
                </td>
              </tr>
            ))}

            {sites.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center"
                >
                  <p className="text-base font-semibold text-gray-900">
                    No available sites
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Search for a city and booking dates.
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
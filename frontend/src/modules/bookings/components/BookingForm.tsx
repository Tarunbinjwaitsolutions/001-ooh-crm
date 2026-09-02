"use client";

import { useState } from "react";

import type { AvailableSite } from "../types";

interface BookingFormProps {
  site: AvailableSite;
  from: string;
  to: string;
  loading: boolean;
  onSubmit: (
    campaignId: string,
    quotationId?: string
  ) => Promise<void>;
  onClose: () => void;
}

export default function BookingForm({
  site,
  from,
  to,
  loading,
  onSubmit,
  onClose,
}: BookingFormProps) {
  const [campaignId, setCampaignId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!campaignId.trim()) {
      setError("Campaign ID is required.");
      return;
    }

    if (!from || !to) {
      setError("Booking dates are required.");
      return;
    }

    if (from > to) {
      setError("From date cannot be after To date.");
      return;
    }

    try {
      await onSubmit(
        campaignId.trim(),
        quotationId.trim() || undefined
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "This site is already booked for the selected date range."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Book Site
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Confirm the site booking details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-3 py-1 text-2xl font-bold text-gray-500 transition hover:bg-[#F9DADA] hover:text-[#8B2424]"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800">
                Booking failed
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Site Details */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-4 text-sm font-bold text-gray-900">
              Booking Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Site Code
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {site.code}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  City
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {site.city}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  From
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {from}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  To
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {to}
                </p>
              </div>
            </div>
          </div>

          {/* Campaign ID */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Campaign ID
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              type="text"
              value={campaignId}
              onChange={(e) => {
                setCampaignId(e.target.value);
                setError("");
              }}
              placeholder="Enter campaign ID"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
            />
          </div>

          {/* Quotation ID */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Quotation ID
              <span className="ml-1 font-normal text-gray-500">
                (optional)
              </span>
            </label>

            <input
              type="text"
              value={quotationId}
              onChange={(e) => {
                setQuotationId(e.target.value);
                setError("");
              }}
              placeholder="Enter quotation ID"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
            />
          </div>

          {/* Duplicate Booking Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm font-medium text-yellow-800">
              If this site is already booked for an
              overlapping date range, the booking will
              be rejected.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-[#8B2424] bg-[#F9DADA] px-5 py-2.5 text-sm font-semibold text-[#8B2424] transition hover:bg-[#8B2424] hover:text-[#F9DADA] focus:outline-none focus:ring-2 focus:ring-[#F9DADA] focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#8B2424] px-6 py-2.5 text-sm font-semibold text-[#F9DADA] transition hover:bg-[#A8383B] focus:outline-none focus:ring-2 focus:ring-[#F9DADA] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Booking..."
                : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
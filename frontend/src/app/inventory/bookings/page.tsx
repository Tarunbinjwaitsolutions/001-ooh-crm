"use client";

import { useState } from "react";

import { useBooking } from "@/modules/bookings/hooks/useBooking";

import type { AvailableSite } from "@/modules/bookings/types";

import AvailabilitySearch from "@/modules/bookings/components/AvailabilitySearch";

import AvailabilityTable from "@/modules/bookings/components/AvailabilityTable";

import BookingForm from "@/modules/bookings/components/BookingForm";

export default function AvailabilityPage() {
  const {
    sites,
    loading,
    bookingLoading,
    error,
    setError,
    searchAvailability,
    bookSite,
  } = useBooking();

  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selectedSite, setSelectedSite] =
    useState<AvailableSite | null>(null);

  const [success, setSuccess] = useState("");

  async function handleSearch() {
    setSuccess("");

    if (!city.trim()) {
      setError("City is required.");
      return;
    }

    if (!from || !to) {
      setError("Select both a start date and an end date.");
      return;
    }

    if (from > to) {
      setError("End date must be on or after the start date.");
      return;
    }

    try {
      await searchAvailability(
        city.trim(),
        from,
        to
      );
    } catch {
      // The booking hook exposes the API error in the page.
    }
  }

  async function handleBooking(
    campaignId: string,
    quotationId?: string
  ) {
    if (!selectedSite) {
      return;
    }

    await bookSite({
      siteId: selectedSite._id,
      campaignId,
      quotationId,
      from,
      to,
    });

    setSelectedSite(null);

    setSuccess(
      "Site booked successfully."
    );

    await searchAvailability(
      city.trim(),
      from,
      to
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Site Availability
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Check available sites and create bookings.
          </p>
        </div>

        <div className="mb-6">
          <AvailabilitySearch
            city={city}
            from={from}
            to={to}
            onCityChange={setCity}
            onFromChange={setFrom}
            onToChange={setTo}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              {success}
            </p>
          </div>
        )}

        <AvailabilityTable
          sites={sites}
          onBook={setSelectedSite}
        />
      </div>

      {selectedSite && (
        <BookingForm
          site={selectedSite}
          from={from}
          to={to}
          loading={bookingLoading}
          onClose={() =>
            setSelectedSite(null)
          }
          onSubmit={handleBooking}
        />
      )}
    </main>
  );
}
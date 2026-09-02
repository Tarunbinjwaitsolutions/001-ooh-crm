"use client";

import {useCallback,useState} from "react";
import { getAvailableSites, createBooking, releaseCampaignBookings } from "../api";
import type { AvailableSite, BookingPayload } from "../types";

export function useBooking() {
  const [sites, setSites] = useState<AvailableSite[]>([]);

  const [loading, setLoading] = useState(false);

  const [bookingLoading, setBookingLoading] = useState(false);

  const [error, setError] = useState("");

  const searchAvailability = useCallback(
      async (
        city: string,
        from: string,
        to: string
      ) => {
        try {
          setLoading(true);
          setError("");

          const result = await getAvailableSites(
              city,
              from,
              to
            );

          setSites(result);

          return result;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to check availability";

          setError(message);

          throw error;
        } finally {
          setLoading(false);
        }
      },
      []
    );

  const bookSite = useCallback(
    async (
      data: BookingPayload
    ) => {
      try {
        setBookingLoading(true);
        setError("");

        const result = await createBooking(data);

        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Booking failed";

        setError(message);

        throw error;
      } finally {
        setBookingLoading(false);
      }
    },
    []
  );

  const releaseBookings = useCallback(
      async (
        campaignId: string
      ) => {
        try {
          setLoading(true);
          setError("");

          return await releaseCampaignBookings(
            campaignId
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to release bookings";

          setError(message);

          throw error;
        } finally {
          setLoading(false);
        }
      },
      []
    );

  return {
    sites,
    loading,
    bookingLoading,
    error,

    searchAvailability,
    bookSite,
    releaseBookings,

    setError,
  };
}
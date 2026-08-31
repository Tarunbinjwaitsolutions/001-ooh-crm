"use client";

import { useEffect, useRef, useState } from "react";

import { createSite, updateSite } from "../api";

import type {
  Site,
  SiteType,
  SiteStatus,
} from "../types";

interface Props {
  site?: Site | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SiteForm({
  site,
  onClose,
  onSuccess,
}: Props) {
  const [city, setCity] = useState("");
  const [type, setType] =
    useState<SiteType>("Airport");

  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [cost, setCost] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [photos, setPhotos] = useState("");
  const [status, setStatus] =
    useState<SiteStatus>("Active");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [typeOpen, setTypeOpen] =
    useState(false);

  const [statusOpen, setStatusOpen] =
    useState(false);

  const typeRef =
    useRef<HTMLDivElement>(null);

  const statusRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!site) return;

    setCity(site.city);
    setType(site.type);
    setAddress(site.address || "");

    setLat(
      String(site.gps.lat)
    );

    setLng(
      String(site.gps.lng)
    );

    setWidth(
      String(site.sizeWidth)
    );

    setHeight(
      String(site.sizeHeight)
    );

    setCost(
      String(site.baseCostPerDay)
    );

    setVendorId(
      site.vendorId || ""
    );

    setPhotos(
      site.photos?.join(", ") || ""
    );

    setStatus(site.status);
  }, [site]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        typeRef.current &&
        !typeRef.current.contains(target)
      ) {
        setTypeOpen(false);
      }

      if (
        statusRef.current &&
        !statusRef.current.contains(target)
      ) {
        setStatusOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!city.trim()) {
      setError("City is required.");
      return;
    }

    if (!lat || !lng) {
      setError(
        "Latitude and longitude are required."
      );
      return;
    }

    if (!width || !height) {
      setError(
        "Width and height are required."
      );
      return;
    }

    if (!cost) {
      setError(
        "Base cost per day is required."
      );
      return;
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const siteWidth = Number(width);
    const siteHeight = Number(height);
    const dailyCost = Number(cost);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < 6 ||
      latitude > 37.5 ||
      longitude < 68 ||
      longitude > 97.5
    ) {
      setError(
        "GPS coordinates must fall within India."
      );
      return;
    }

    if (
      !Number.isFinite(siteWidth) ||
      siteWidth <= 0 ||
      !Number.isFinite(siteHeight) ||
      siteHeight <= 0
    ) {
      setError(
        "Width and height must be greater than 0."
      );
      return;
    }

    if (
      !Number.isFinite(dailyCost) ||
      dailyCost < 0 ||
      !Number.isInteger(dailyCost)
    ) {
      setError(
        "Base cost per day must be a nonnegative whole number."
      );
      return;
    }

    try {
      setLoading(true);

      const data = {
        city: city.trim(),

        type,

        address:
          address.trim() || undefined,

        gps: {
          lat: latitude,
          lng: longitude,
        },

        sizeWidth: siteWidth,

        sizeHeight: siteHeight,

        baseCostPerDay: dailyCost,

        vendorId:
          vendorId.trim() || null,

        status,

        photos: photos
          .split(",")
          .map((photo) =>
            photo.trim()
          )
          .filter(Boolean),
      };

      if (site) {
        await updateSite(
          site._id,
          data
        );
      } else {
        await createSite(data);
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save site."
      );
    } finally {
      setLoading(false);
    }
  }

  const typeOptions: SiteType[] = [
    "Airport",
    "Highway",
    "Mall",
    "Metro",
    "Market",
    "Other",
  ];

  const statusOptions: SiteStatus[] = [
    "Active",
    "Maintenance",
    "Inactive",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {site
                ? "Edit Site"
                : "Add Site"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {site
                ? "Update site information"
                : "Add a new advertising site"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-2xl leading-none text-gray-500 transition hover:bg-[#F9DADA] hover:text-[#8B2424]"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-5 p-6">

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* City / Type / Status */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* City */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                  City
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  placeholder="Enter city"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
                />
              </div>

              {/* Type */}
              <div
                ref={typeRef}
                className="relative"
              >
                <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                  Type
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setTypeOpen(!typeOpen);
                    setStatusOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
                >
                  <span>
                    {type}
                  </span>

                  <span className="text-[#8B2424]">
                    ▾
                  </span>
                </button>

                {typeOpen && (
                  <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    {typeOptions.map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setType(option);
                            setTypeOpen(false);
                          }}
                          className={`block w-full cursor-pointer px-4 py-2.5 text-left transition hover:bg-[#F9DADA] hover:text-[#8B2424] ${
                            type === option
                              ? "bg-[#F9DADA] text-[#8B2424]"
                              : "text-gray-900"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div
                ref={statusRef}
                className="relative"
              >
                <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                  Status
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setStatusOpen(
                      !statusOpen
                    );
                    setTypeOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
                >
                  <span>
                    {status}
                  </span>

                  <span className="text-[#8B2424]">
                    ▾
                  </span>
                </button>

                {statusOpen && (
                  <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    {statusOptions.map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setStatus(
                              option
                            );
                            setStatusOpen(
                              false
                            );
                          }}
                          className={`block w-full cursor-pointer px-4 py-2.5 text-left transition hover:bg-[#F9DADA] hover:text-[#8B2424] ${
                            status === option
                              ? "bg-[#F9DADA] text-[#8B2424]"
                              : "text-gray-900"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                Address
              </label>

              <input
                type="text"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="Enter full address"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
              />
            </div>

            {/* GPS */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                  Latitude
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) =>
                    setLat(e.target.value)
                  }
                  placeholder="e.g. 22.7196"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                  Longitude
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) =>
                    setLng(e.target.value)
                  }
                  placeholder="e.g. 75.8577"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
                />
              </div>
            </div>

            {/* Size + Cost */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                  Width
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  required
                  value={width}
                  onChange={(e) =>
                    setWidth(e.target.value)
                  }
                  placeholder="Enter width"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                  Height
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  required
                  value={height}
                  onChange={(e) =>
                    setHeight(e.target.value)
                  }
                  placeholder="Enter height"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                  Base Cost / Day
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  required
                  value={cost}
                  onChange={(e) =>
                    setCost(e.target.value)
                  }
                  placeholder="Enter cost in paise"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
                />
              </div>
            </div>

            {/* Vendor */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                Vendor ID
              </label>

              <input
                type="text"
                value={vendorId}
                onChange={(e) =>
                  setVendorId(
                    e.target.value
                  )
                }
                placeholder="Enter vendor ID (optional)"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-900">
                Photos (URLs)
              </label>

              <input
                type="text"
                value={photos}
                onChange={(e) =>
                  setPhotos(e.target.value)
                }
                placeholder="Enter photo URLs separated by comma"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Example:
                https://example.com/site.jpg
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-[#8B2424] bg-[#F9DADA] px-5 py-2.5 font-semibold text-[#8B2424] transition hover:bg-[#8B2424] hover:text-[#F9DADA] focus:outline-none focus:ring-2 focus:ring-[#F9DADA] focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#8B2424] px-6 py-2.5 font-semibold text-[#F9DADA] shadow-sm transition hover:bg-[#A8383B] focus:outline-none focus:ring-2 focus:ring-[#F9DADA] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : site
                  ? "Update Site"
                  : "Save Site"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
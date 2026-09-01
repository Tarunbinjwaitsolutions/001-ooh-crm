"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  city: string;
  type: string;
  status: string;
  onCityChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function SiteFilters({
  city,
  type,
  status,
  onCityChange,
  onTypeChange,
  onStatusChange,
}: Props) {
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

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

  const typeOptions = [
    "Airport",
    "Highway",
    "Mall",
    "Metro",
    "Market",
    "Other",
  ];

  const statusOptions = [
    "Active",
    "Maintenance",
    "Inactive",
  ];

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-3">

      {/* City */}
      <input
        type="text"
        value={city}
        onChange={(e) =>
          onCityChange(e.target.value)
        }
        placeholder="Search city..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
      />

      {/* Type */}
      <div
        ref={typeRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => {
            setTypeOpen(!typeOpen);
            setStatusOpen(false);
          }}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
        >
          <span>
            {type || "All Types"}
          </span>

          <span className="text-gray-500">
            ▾
          </span>
        </button>

        {typeOpen && (
          <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">

            <button
              type="button"
              onClick={() => {
                onTypeChange("");
                setTypeOpen(false);
              }}
              className="block w-full cursor-pointer px-4 py-2.5 text-left text-gray-900 transition hover:bg-[#F9DADA] hover:text-[#8B2424]"
            >
              All Types
            </button>

            {typeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onTypeChange(option);
                  setTypeOpen(false);
                }}
                className="block w-full cursor-pointer px-4 py-2.5 text-left text-gray-900 transition hover:bg-[#F9DADA] hover:text-[#8B2424]"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div
        ref={statusRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => {
            setStatusOpen(!statusOpen);
            setTypeOpen(false);
          }}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
        >
          <span>
            {status || "All Status"}
          </span>

          <span className="text-gray-500">
            ▾
          </span>
        </button>

        {statusOpen && (
          <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">

            <button
              type="button"
              onClick={() => {
                onStatusChange("");
                setStatusOpen(false);
              }}
              className="block w-full cursor-pointer px-4 py-2.5 text-left text-gray-900 transition hover:bg-[#F9DADA] hover:text-[#8B2424]"
            >
              All Status
            </button>

            {statusOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onStatusChange(option);
                  setStatusOpen(false);
                }}
                className="block w-full cursor-pointer px-4 py-2.5 text-left text-gray-900 transition hover:bg-[#F9DADA] hover:text-[#8B2424]"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
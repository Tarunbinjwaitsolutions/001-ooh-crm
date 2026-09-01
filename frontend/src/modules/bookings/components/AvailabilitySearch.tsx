"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  city: string;
  from: string;
  to: string;
  onCityChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function AvailabilitySearch({
  city,
  from,
  to,
  onCityChange,
  onFromChange,
  onToChange,
  onSearch,
  loading,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-bold text-gray-900">
        Check Availability
      </h2>

      <p className="mb-5 text-sm text-gray-600">
        Select city and booking dates.
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {/* City */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            City
          </label>

          <input
            type="text"
            value={city}
            onChange={(e) =>
              onCityChange(e.target.value)
            }
            placeholder="Enter city"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
          />
        </div>

        {/* From Date */}
        <CustomDatePicker
          label="From Date"
          value={from}
          onChange={onFromChange}
        />

        {/* To Date */}
        <CustomDatePicker
          label="To Date"
          value={to}
          onChange={onToChange}
        />

        {/* Search */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="w-full rounded-lg bg-[#8B2424] px-5 py-3 font-semibold text-[#F9DADA] transition hover:bg-[#A8383B] focus:outline-none focus:ring-2 focus:ring-[#F9DADA] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Checking..."
              : "Check Availability"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Custom Date Picker
========================= */

function CustomDatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const [currentMonth, setCurrentMonth] =
    useState(() => {
      if (value) {
        const [year, month] =
          value.split("-").map(Number);

        return new Date(year, month - 1, 1);
      }

      return new Date(2000, 0, 1);
    });

  const pickerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      const today = new Date();
      setCurrentMonth(
        new Date(today.getFullYear(), today.getMonth(), 1),
      );
    }
  }, [value]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
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

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthName =
    currentMonth.toLocaleString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  function formatDate(day: number) {
    const selectedYear =
      currentMonth.getFullYear();

    const selectedMonth =
      String(
        currentMonth.getMonth() + 1
      ).padStart(2, "0");

    const selectedDay =
      String(day).padStart(2, "0");

    return `${selectedYear}-${selectedMonth}-${selectedDay}`;
  }

  function isSelected(day: number) {
    return value === formatDate(day);
  }

  function previousMonth() {
    setCurrentMonth(
      new Date(year, month - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(year, month + 1, 1)
    );
  }

  return (
    <div
      ref={pickerRef}
      className="relative"
    >
      <label className="mb-2 block text-sm font-semibold text-gray-900">
        {label}
      </label>

      {/* Date Input */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-gray-900 outline-none transition hover:border-[#8B2424] focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
      >
        <span
          className={
            value
              ? "text-gray-900"
              : "text-gray-400"
          }
        >
          {value || "Select date"}
        </span>

        <span className="text-[#8B2424]">
          📅
        </span>
      </button>

      {/* Calendar */}
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full min-w-[280px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">

          {/* Calendar Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={previousMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8B2424] transition hover:bg-[#F9DADA]"
            >
              ‹
            </button>

            <span className="text-sm font-bold text-gray-900">
              {monthName}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8B2424] transition hover:bg-[#F9DADA]"
            >
              ›
            </button>
          </div>

          {/* Week Days */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {[
              "Su",
              "Mo",
              "Tu",
              "We",
              "Th",
              "Fr",
              "Sa",
            ].map((day) => (
              <div
                key={day}
                className="py-1 text-center text-xs font-semibold text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-9"
                  />
                );
              }

              const selected =
                isSelected(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(
                      formatDate(day)
                    );
                    setOpen(false);
                  }}
                  className={`h-9 rounded-lg text-sm font-medium transition ${
                    selected
                      ? "bg-[#8B2424] text-[#F9DADA]"
                      : "text-gray-700 hover:bg-[#F9DADA] hover:text-[#8B2424]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
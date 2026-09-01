"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  status: string;
  type: string;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Overdue", label: "Overdue" },
];

const typeOptions = [
  { value: "", label: "All Task Types" },
  { value: "Printing", label: "Printing" },
  { value: "Installation", label: "Installation" },
  { value: "Verification", label: "Verification" },
  { value: "Removal", label: "Removal" },
  { value: "Custom", label: "Custom" },
];

export default function TaskFilters({
  status,
  type,
  onStatusChange,
  onTypeChange,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Task Filters
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Filter tasks by status and task type.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Dropdown
          label="Status"
          value={status}
          options={statusOptions}
          onChange={onStatusChange}
        />

        <Dropdown
          label="Task Type"
          value={type}
          options={typeOptions}
          onChange={onTypeChange}
        />
      </div>
    </div>
  );
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected =
    options.find((option) => option.value === value) ??
    options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-gray-900">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-left text-sm text-gray-900 outline-none transition ${
          open
            ? "border-[#8B2424] ring-2 ring-[#F9DADA]"
            : "border-gray-300 hover:border-[#8B2424]"
        }`}
      >
        <span>{selected.label}</span>

        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          {options.map((option) => {
            const active =
              option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-[#F9DADA] font-semibold text-[#8B2424]"
                    : "text-gray-700 hover:bg-[#FFF7F7] hover:text-[#8B2424]"
                }`}
              >
                <span>{option.label}</span>

                {active && (
                  <svg
                    className="h-4 w-4 text-[#8B2424]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.6-3.6a1 1 0 011.42-1.42l2.89 2.89 6.49-6.49a1 1 0 011.42 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
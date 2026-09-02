"use client";

import { useState } from "react";

interface Props {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function PurchaseOrderFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const options = [
    "Draft",
    "Issued",
    "Accepted",
    "Cancelled",
  ];

  return (
    <div className="rounded-2xl border border-[#E8E8EC] bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* SEARCH */}

        <div>
          <label className="mb-2 block text-sm font-bold text-[#1F2937]">
            Search Purchase Order
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            placeholder="Search PO, vendor or campaign..."
            className="
              w-full
              rounded-xl
              border border-gray-300
              bg-white
              px-4 py-3
              text-sm
              text-[#1F2937]
              outline-none
              transition
              focus:border-[#A8333B]
              focus:ring-2
              focus:ring-[#F9DADA]
            "
          />
        </div>

        {/* STATUS */}

        <div className="relative">
          <label className="mb-2 block text-sm font-bold text-[#1F2937]">
            Status
          </label>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-xl
              border border-gray-300
              bg-white
              px-4 py-3
              text-left
              text-sm
              font-medium
              text-[#1F2937]
              outline-none
              transition
              hover:border-[#A8333B]
              focus:border-[#A8333B]
              focus:ring-2
              focus:ring-[#F9DADA]
            "
          >
            <span>
              {status || "All Status"}
            </span>

            <span
              className={`text-[#667085] transition ${
                open ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </button>

          {open && (
            <div
              className="
                absolute
                left-0
                right-0
                z-30
                mt-1
                overflow-hidden
                rounded-xl
                border border-[#E8E8EC]
                bg-white
                shadow-lg
              "
            >
              <button
                type="button"
                onClick={() => {
                  onStatusChange("");
                  setOpen(false);
                }}
                className="
                  block
                  w-full
                  px-4 py-3
                  text-left
                  text-sm
                  font-medium
                  text-[#1F2937]
                  transition
                  hover:bg-[#F9DADA]
                  hover:text-[#A8333B]
                "
              >
                All Status
              </button>

              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onStatusChange(option);
                    setOpen(false);
                  }}
                  className="
                    block
                    w-full
                    px-4 py-3
                    text-left
                    text-sm
                    font-medium
                    text-[#1F2937]
                    transition
                    hover:bg-[#F9DADA]
                    hover:text-[#A8333B]
                  "
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
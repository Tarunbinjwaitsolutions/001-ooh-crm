"use client";

import type { Campaign } from "../types";

interface Props {
  status: Campaign["status"];
}

const steps = [
  {
    key: "Draft",
    label: "Draft",
  },
  {
    key: "Approved",
    label: "Approved",
  },
  {
    key: "InProgress",
    label: "In Progress",
  },
  {
    key: "Completed",
    label: "Completed",
  },
] as const;

export default function CampaignStatusTimeline({
  status,
}: Props) {
  if (status === "Cancelled") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F9DADA] text-xl font-semibold text-[#8B2424]">
            ×
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Campaign Cancelled
            </p>

            <p className="mt-1 text-sm text-gray-500">
              This campaign is no longer active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex(
    (step) => step.key === status,
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          Campaign Lifecycle
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Track the current campaign status.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[600px] items-start">
          {steps.map((step, index) => {
            const completed =
              index <= currentIndex;

            const current =
              index === currentIndex;

            return (
              <div
                key={step.key}
                className="flex flex-1 items-start"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                      completed
                        ? "border-[#8B2424] bg-[#8B2424] text-[#F9DADA]"
                        : "border-gray-300 bg-white text-gray-400"
                    } ${
                      current
                        ? "ring-4 ring-[#F9DADA]"
                        : ""
                    }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`mt-2 whitespace-nowrap text-xs font-medium ${
                      completed
                        ? "text-[#8B2424]"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mt-5 h-0.5 flex-1 ${
                      index < currentIndex
                        ? "bg-[#8B2424]"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
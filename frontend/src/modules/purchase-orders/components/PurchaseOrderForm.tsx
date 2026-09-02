"use client";

import { useEffect, useState } from "react";

import type {
  PurchaseOrder,
  PurchaseOrderFormData,
  PurchaseOrderLineItem,
} from "../types";

interface Props {
  order: PurchaseOrder | null;
  saving: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (
    data: PurchaseOrderFormData,
  ) => Promise<boolean>;
}

const emptyItem = (): PurchaseOrderLineItem => ({
  siteId: "",
  from: "",
  to: "",
  negotiatedRatePerDay: 0,
  days: 0,
  amount: 0,
});

export default function PurchaseOrderForm({
  order,
  saving,
  onClose,
  onSuccess,
  onSubmit,
}: Props) {
  const [campaignId, setCampaignId] =
    useState("");

  const [vendorId, setVendorId] =
    useState("");

  const [lineItems, setLineItems] =
    useState<PurchaseOrderLineItem[]>([
      emptyItem(),
    ]);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) {
      setCampaignId("");
      setVendorId("");
      setLineItems([emptyItem()]);
      return;
    }

    setCampaignId(
      typeof order.campaignId === "string"
        ? order.campaignId
        : order.campaignId._id,
    );

    setVendorId(
      typeof order.vendorId === "string"
        ? order.vendorId
        : order.vendorId._id,
    );

    setLineItems(
      order.lineItems.map((item) => ({
        ...item,
        from: item.from
          ? item.from.slice(0, 10)
          : "",
        to: item.to
          ? item.to.slice(0, 10)
          : "",
      })),
    );
  }, [order]);

  function updateItem(
    index: number,
    field: keyof PurchaseOrderLineItem,
    value: string | number,
  ) {
    setLineItems((items) =>
      items.map((item, i) => {
        if (i !== index) return item;

        const updated = {
          ...item,
          [field]: value,
        };

        const from = new Date(updated.from);
        const to = new Date(updated.to);

        const days =
          updated.from &&
          updated.to &&
          !Number.isNaN(from.getTime()) &&
          !Number.isNaN(to.getTime()) &&
          to >= from
            ? Math.floor(
                (to.getTime() -
                  from.getTime()) /
                  86400000,
              ) + 1
            : 0;

        return {
          ...updated,
          days,
          amount:
            days *
            Number(
              updated.negotiatedRatePerDay || 0,
            ),
        };
      }),
    );
  }

  function addItem() {
    setLineItems((items) => [
      ...items,
      emptyItem(),
    ]);
  }

  function removeItem(index: number) {
    setLineItems((items) =>
      items.length === 1
        ? items
        : items.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();
    setError("");

    if (!campaignId.trim()) {
      setError("Campaign is required");
      return;
    }

    if (!vendorId.trim()) {
      setError("Vendor is required");
      return;
    }

    if (
      lineItems.some(
        (item) =>
          !item.siteId ||
          !item.from ||
          !item.to ||
          item.days <= 0 ||
          item.negotiatedRatePerDay <= 0,
      )
    ) {
      setError(
        "Please complete all site line items",
      );
      return;
    }

    const success = await onSubmit({
      campaignId,
      vendorId,
      lineItems: lineItems.map(
        ({
          siteId,
          from,
          to,
          negotiatedRatePerDay,
        }) => ({
          siteId,
          from,
          to,
          negotiatedRatePerDay,
        }),
      ),
    });

    if (success) onSuccess();
  }

  const total = lineItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#EEEEF3] px-6 py-5">
          <div>

            <h2 className="mt-3 text-xl font-bold text-[#1F2937]">
              {order
                ? "Edit Purchase Order"
                : "Create Purchase Order"}
            </h2>

            <p className="mt-1 text-sm text-[#667085]">
              Add vendor sites and negotiated rates
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-2xl font-bold text-gray-500 hover:bg-[#F9DADA] hover:text-[#8B2424]"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            )}

            <section className="rounded-2xl border border-[#E8E8EC] p-5">
              <h3 className="mb-4 text-sm font-bold text-[#1F2937]">
                Purchase Order Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Campaign ID"
                  value={campaignId}
                  placeholder="Enter campaign ID"
                  onChange={setCampaignId}
                />

                <Field
                  label="Vendor ID"
                  value={vendorId}
                  placeholder="Enter vendor ID"
                  onChange={setVendorId}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[#E8E8EC] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1F2937]">
                    Site Line Items
                  </h3>

                  <p className="mt-1 text-xs text-[#667085]">
                    Add site, date range and negotiated
                    daily rate.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-lg bg-[#F9DADA] px-4 py-2 text-xs font-bold text-[#8B2424] hover:bg-[#8B2424] hover:text-white"
                >
                  + Add Site
                </button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#E8E8EC] bg-[#FAFAFB] p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-bold text-[#1F2937]">
                        Site {index + 1}
                      </p>

                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          className="text-xs font-bold text-[#8B2424] hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                      <Field
                        label="Site ID"
                        value={item.siteId}
                        placeholder="Site ID"
                        onChange={(value) =>
                          updateItem(
                            index,
                            "siteId",
                            value,
                          )
                        }
                      />

                      <Field
                        label="From Date"
                        type="date"
                        value={item.from}
                        onChange={(value) =>
                          updateItem(
                            index,
                            "from",
                            value,
                          )
                        }
                      />

                      <Field
                        label="To Date"
                        type="date"
                        value={item.to}
                        onChange={(value) =>
                          updateItem(
                            index,
                            "to",
                            value,
                          )
                        }
                      />

                      <Field
                        label="Rate / Day"
                        type="number"
                        value={String(
                          item.negotiatedRatePerDay ||
                            "",
                        )}
                        placeholder="0"
                        onChange={(value) =>
                          updateItem(
                            index,
                            "negotiatedRatePerDay",
                            Number(value),
                          )
                        }
                      />

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#667085]">
                          Amount
                        </label>

                        <div className="rounded-xl border border-[#E8E8EC] bg-white px-4 py-3 text-sm font-bold text-[#8B2424]">
                          ₹
                          {item.amount.toLocaleString(
                            "en-IN",
                          )}
                        </div>
                      </div>
                    </div>

                    {item.days > 0 && (
                      <p className="mt-3 text-xs font-semibold text-[#667085]">
                        {item.days} day
                        {item.days !== 1
                          ? "s"
                          : ""}{" "}
                        × ₹
                        {item.negotiatedRatePerDay.toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#EEEEF3] pt-5">
                <span className="text-sm font-bold text-[#1F2937]">
                  Total Amount
                </span>

                <span className="text-xl font-bold text-[#8B2424]">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#EEEEF3] bg-[#FAFAFB] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#8B2424] bg-[#F9DADA] px-5 py-2.5 text-sm font-bold text-[#8B2424] hover:bg-[#8B2424] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#8B2424] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#A8383B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : order
                  ? "Update Draft"
                  : "Create Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#667085]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-[#8B2424] focus:ring-2 focus:ring-[#F9DADA]"
      />
    </div>
  );
}
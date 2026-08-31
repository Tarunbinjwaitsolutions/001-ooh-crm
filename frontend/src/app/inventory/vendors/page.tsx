"use client";

import { useMemo, useState } from "react";

import VendorFilters from "@/modules/inventory/vendors/components/VendorFilters";
import VendorTable from "@/modules/inventory/vendors/components/VendorTable";
import VendorForm from "@/modules/inventory/vendors/components/VendorForm";
import VendorDetails from "@/modules/inventory/vendors/components/VendorDetails";
import VendorSitesModal from "@/modules/inventory/vendors/components/VendorSitesModal";

import { useVendors } from "@/modules/inventory/vendors/hooks/useVendors";

import type {
  Vendor,
  VendorFormData,
  VendorSite,
} from "@/modules/inventory/vendors/types";

export default function VendorsPage() {
  const {
    vendors,
    loading,
    saving,
    error,
    addVendor,
    editVendor,
    deactivate,
    getSites,
  } = useVendors();

  /* =========================
     FILTER STATE
  ========================= */

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  /* =========================
     MODAL STATE
  ========================= */

  const [formOpen, setFormOpen] =
    useState(false);

  const [detailsVendor, setDetailsVendor] =
    useState<Vendor | null>(null);

  const [editingVendor, setEditingVendor] =
    useState<Vendor | null>(null);

  const [sitesVendor, setSitesVendor] =
    useState<Vendor | null>(null);

  const [sites, setSites] =
    useState<VendorSite[]>([]);

  const [sitesLoading, setSitesLoading] =
    useState(false);

  /* =========================
     FILTER VENDORS
  ========================= */

  const filteredVendors = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesSearch =
        !value ||
        vendor.name
          .toLowerCase()
          .includes(value) ||
        vendor.state
          ?.toLowerCase()
          .includes(value) ||
        vendor.city
          .toLowerCase()
          .includes(value) ||
        vendor.contactPerson
          ?.toLowerCase()
          .includes(value) ||
        vendor.panNumber
          ?.toLowerCase()
          .includes(value) ||
        vendor.msmeNumber
          ?.toLowerCase()
          .includes(value) ||
        vendor.gstNumber
          ?.toLowerCase()
          .includes(value);

      const matchesStatus =
        !status ||
        vendor.status === status;

      const matchesState =
        !state ||
        vendor.state
          ?.toLowerCase() ===
          state.toLowerCase();

      const matchesCity =
        !city ||
        vendor.city
          .toLowerCase() ===
          city.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesState &&
        matchesCity
      );
    });
  }, [
    vendors,
    search,
    status,
    state,
    city,
  ]);

  /* =========================
     ADD
  ========================= */

  function openAdd() {
    setEditingVendor(null);
    setFormOpen(true);
  }

  /* =========================
     EDIT
  ========================= */

  function openEdit(
    vendor: Vendor,
  ) {
    setEditingVendor(vendor);
    setFormOpen(true);
  }

  /* =========================
     SUBMIT
  ========================= */

  async function handleSubmit(
    data: VendorFormData,
  ) {
    if (editingVendor) {
      return editVendor(
        editingVendor._id,
        data,
      );
    }

    return addVendor(data);
  }

  /* =========================
     VIEW SITES
  ========================= */

  async function openSites(
    vendor: Vendor,
  ) {
    setSitesVendor(vendor);
    setSites([]);
    setSitesLoading(true);

    const result =
      await getSites(vendor._id);

    setSites(result);
    setSitesLoading(false);
  }

  /* =========================
     DEACTIVATE
  ========================= */

  async function handleDeactivate(
    vendor: Vendor,
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to deactivate ${vendor.name}?`,
      );

    if (!confirmed) {
      return;
    }

    await deactivate(
      vendor._id,
    );
  }

  /* =========================
     CLEAR FILTERS
  ========================= */

  function clearFilters() {
    setSearch("");
    setStatus("");
    setState("");
    setCity("");
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-[#1F2937]">
              Vendors
            </h1>

            <p className="mt-1 text-sm text-[#667085]">
              Manage vendors and linked sites
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-[#8B2424] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#A8383B] focus:outline-none focus:ring-2 focus:ring-[#F9DADA] focus:ring-offset-2"
          >
            + Add Vendor
          </button>
        </div>

        {/* =========================
            SUMMARY
        ========================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <Summary
            title="Total Vendors"
            value={vendors.length}
          />

          <Summary
            title="Active"
            value={
              vendors.filter(
                (vendor) =>
                  vendor.status ===
                  "Active",
              ).length
            }
          />

          <Summary
            title="Inactive"
            value={
              vendors.filter(
                (vendor) =>
                  vendor.status ===
                  "Inactive",
              ).length
            }
          />

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <VendorFilters
          search={search}
          status={status}
          state={state}
          city={city}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onStateChange={setState}
          onCityChange={setCity}
        />

        {/* =========================
            CLEAR FILTERS
        ========================= */}

        {(search ||
          status ||
          state ||
          city) && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[#8B2424] transition hover:bg-[#F9DADA]"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =========================
            TABLE
        ========================= */}

        <div className="mt-6">

          {loading ? (
            <div className="rounded-2xl border border-[#E8E8EC] bg-white p-16 text-center shadow-sm">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F9DADA] border-t-[#8B2424]" />

              <p className="mt-4 text-sm text-[#667085]">
                Loading vendors...
              </p>

            </div>
          ) : (
            <VendorTable
              vendors={filteredVendors}
              onView={setDetailsVendor}
              onEdit={openEdit}
              onSites={openSites}
              onDeactivate={
                handleDeactivate
              }
            />
          )}

        </div>
      </div>

      {/* =========================
          FORM
      ========================= */}

      {formOpen && (
        <VendorForm
          vendor={editingVendor}
          saving={saving}
          onClose={() =>
            setFormOpen(false)
          }
          onSubmit={async (data) => {
            const success =
              await handleSubmit(data);

            if (success) {
              setFormOpen(false);
            }

            return success;
          }}
        />
      )}

      {/* =========================
          DETAILS
      ========================= */}

      {detailsVendor && (
        <VendorDetails
          vendor={detailsVendor}
          onClose={() =>
            setDetailsVendor(null)
          }
          onEdit={() => {
            setEditingVendor(
              detailsVendor,
            );

            setDetailsVendor(null);
            setFormOpen(true);
          }}
        />
      )}

      {/* =========================
          SITES
      ========================= */}

      {sitesVendor && (
        <VendorSitesModal
          vendor={sitesVendor}
          sites={sites}
          loading={sitesLoading}
          onClose={() => {
            setSitesVendor(null);
            setSites([]);
          }}
        />
      )}
    </main>
  );
}

/* =========================
   SUMMARY CARD
========================= */

function Summary({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      className="rounded-2xl border border-[#E8E8EC] bg-white p-5 shadow-sm transition hover:border-[#F0C7C7] hover:shadow-md"
    >
      <p className="text-sm font-medium text-[#667085]">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#1F2937]">
        {value}
      </p>
    </div>
  );
}
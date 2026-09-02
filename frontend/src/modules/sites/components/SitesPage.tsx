"use client";

import { useState } from "react";

import { useSites } from "@/modules/sites/hooks/useSites";
import type { Site } from "@/modules/sites/types";

import SiteFilters from "@/modules/sites/components/SiteFilters";
import SiteTable from "@/modules/sites/components/SiteTable";
import SiteForm from "@/modules/sites/components/SiteForm";

export default function SitesPage() {
  const {
    sites,
    loading,
    error,
    loadSites,
  } = useSites();

  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedSite, setSelectedSite] =
    useState<Site | null>(null);

  /* -----------------------------
     Filter Sites
  ----------------------------- */

  const filteredSites = sites.filter((site) => {
    const cityMatch =
      !city ||
      site.city
        .toLowerCase()
        .includes(city.toLowerCase());

    const typeMatch =
      !type || site.type === type;

    const statusMatch =
      !status || site.status === status;

    return (
      cityMatch &&
      typeMatch &&
      statusMatch
    );
  });

  /* -----------------------------
     Add Site
  ----------------------------- */

  function handleAddSite() {
    setSelectedSite(null);
    setShowForm(true);
  }

  /* -----------------------------
     Edit Site
  ----------------------------- */

  function handleEditSite(site: Site) {
    setSelectedSite(site);
    setShowForm(true);
  }

  /* -----------------------------
     Close Form
  ----------------------------- */

  function handleCloseForm() {
    setShowForm(false);
    setSelectedSite(null);
  }

  /* -----------------------------
     Form Success
  ----------------------------- */

  async function handleFormSuccess() {
    setShowForm(false);
    setSelectedSite(null);

    await loadSites();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 ">
              Selected Media Registry
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage advertising sites
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSite}
            className="rounded-lg bg-[#8B2424] px-5 py-2.5 text-sm font-semibold text-[#F9DADA] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#A8383B] focus:ring-offset-2"
          >
            + Add Site
          </button>
        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="mb-6">
          <SiteFilters
            city={city}
            type={type}
            status={status}
            onCityChange={setCity}
            onTypeChange={setType}
            onStatusChange={setStatus}
          />
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-5 flex items-center rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Failed to fetch sites
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#8B2424]" />

            <p className="mt-4 text-sm text-gray-500">
              Loading sites...
            </p>
          </div>
        ) : (
          /* =========================
             SITE TABLE
          ========================= */

          <SiteTable
            sites={filteredSites}
            onEdit={handleEditSite}
          />
        )}
      </div>

      {/* =========================
          ADD / EDIT SITE MODAL
      ========================= */}

      {showForm && (
        <SiteForm
          site={selectedSite}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </main>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Field, FieldWrapper, Spinner, Card } from '@/shared/ui';
import { sitesApi } from '@/modules/sites/api';
import type { Site } from '@/modules/sites/types';

export default function AvailabilityPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [city, setCity] = useState('');

  const [availableSites, setAvailableSites] = useState<Site[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      setError('Please select both from and to dates');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const sites = await sitesApi.getAvailability(fromDate, toDate, city);
      setAvailableSites(sites);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Inventory Availability</h1>
        <p className="text-sm text-slate-500">Check for available sites within a date range.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <FieldWrapper label="City (Optional)">
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </FieldWrapper>
          </div>
          <div className="flex-1">
            <FieldWrapper label="From Date" required>
              <input
                type="date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </FieldWrapper>
          </div>
          <div className="flex-1">
            <FieldWrapper label="To Date" required>
              <input
                type="date"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </FieldWrapper>
          </div>
          <div className="md:w-32">
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Check
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {availableSites && (
        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-medium text-slate-900 dark:text-white">
              {availableSites.length} Available Sites
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800/50 dark:text-white">
                <tr>
                  {/* <th className="px-4 py-3 font-medium">Site Code</th> */}
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  {/* <th className="px-4 py-3 font-medium">Vendor</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {availableSites.map((site) => (
                  <tr key={site._id || site.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <Link href={`/sites/${site._id || site.id}`} className="font-medium text-primary hover:underline">
                        {site.siteCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{site.city}</td>
                    <td className="px-4 py-3">{site.type}</td>
                    <td className="px-4 py-3 truncate max-w-[150px]">
                      {typeof site.vendorId === 'object' && site.vendorId !== null ? (site.vendorId as any).name : 'N/A'}
                    </td>
                  </tr>
                ))}
                {availableSites.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No available sites found for the selected dates and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useVendors } from '@/modules/vendors/hooks/use-vendors';
import { Card, Button, Badge, Spinner } from '@/shared/ui';

export default function VendorsPage() {
  const [search, setSearch] = useState('');
  const { vendors, isLoading, error, updateFilter } = useVendors();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Vendors</h1>
        <Link href="/vendors/new">
          <Button variant="primary">Add Vendor</Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            />
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center"><Spinner /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800/50 dark:text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {vendors.map((vendor) => (
                  <tr key={vendor._id || vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <Link href={`/vendors/${vendor._id || vendor.id}`} className="font-medium text-primary hover:underline">
                        {vendor.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{vendor.city}</td>
                    <td className="px-4 py-3">
                      <div>{vendor.contactPerson}</div>
                      <div className="text-xs text-slate-500">{vendor.mobile}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>
                        {vendor.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No vendors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

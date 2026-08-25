'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePurchaseOrders } from '@/modules/purchase-orders/hooks/use-purchase-orders';
import { Card, Button, Badge, Spinner } from '@/shared/ui';
import { useAuth } from '@/shared/auth/auth-context';

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('');
  const { purchaseOrders, isLoading, error, updateFilter } = usePurchaseOrders();
  const { hasPermission } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Purchase Orders</h1>
        {hasPermission('purchase_orders.manage') && (
          <Link href="/purchase-orders/new">
            <Button variant="primary">Create PO</Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="text"
              placeholder="Search by PO Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            />
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          <select 
            onChange={(e) => updateFilter('status', e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Issued">Issued</option>
            <option value="Accepted">Accepted</option>
            <option value="Cancelled">Cancelled</option>
          </select>
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
                  <th className="px-4 py-3 font-medium">PO Number</th>
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {purchaseOrders.map((po) => {
                  const campaignName = typeof po.campaignId === 'object' && po.campaignId !== null ? (po.campaignId as any).name : 'N/A';
                  const vendorName = typeof po.vendorId === 'object' && po.vendorId !== null ? (po.vendorId as any).name : 'N/A';

                  return (
                    <tr key={po._id || po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <Link href={`/purchase-orders/${po._id || po.id}`} className="font-medium text-primary hover:underline">
                          {po.poNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{campaignName}</td>
                      <td className="px-4 py-3">{vendorName}</td>
                      <td className="px-4 py-3 font-medium">₹{po.totalAmount}</td>
                      <td className="px-4 py-3">
                        <Badge>
                          {po.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No purchase orders found.
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

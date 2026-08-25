'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePurchaseOrder } from '@/modules/purchase-orders/hooks/use-purchase-orders';
import { Card, Badge, Spinner, Button } from '@/shared/ui';
import { useAuth } from '@/shared/auth/auth-context';
import { purchaseOrdersApi } from '@/modules/purchase-orders/api';
import { useState } from 'react';

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { purchaseOrder, isLoading, error, mutate } = usePurchaseOrder(id);
  const { hasPermission } = useAuth();
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (error || !purchaseOrder) return <div className="p-8 text-red-500">{error || 'PO not found'}</div>;

  const vendorName = typeof purchaseOrder.vendorId === 'object' && purchaseOrder.vendorId !== null ? (purchaseOrder.vendorId as any).name : 'N/A';
  const campaignName = typeof purchaseOrder.campaignId === 'object' && purchaseOrder.campaignId !== null ? (purchaseOrder.campaignId as any).name : 'N/A';

  const handleUpdateStatus = async (status: 'Issued' | 'Accepted' | 'Cancelled') => {
    setIsUpdatingStatus(true);
    try {
      await purchaseOrdersApi.updateStatus(id, status);
      await mutate();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const blob = await purchaseOrdersApi.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PO-${purchaseOrder.poNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to download PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            {purchaseOrder.poNumber}
            <Badge>
              {purchaseOrder.status}
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generated on {new Date(purchaseOrder.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          {purchaseOrder.status !== 'Draft' && (
            <Button variant="secondary" onClick={handleDownloadPDF} isLoading={isDownloading}>
              Download PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Details</h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Campaign</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{campaignName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Vendor</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {typeof purchaseOrder.vendorId === 'object' ? (
                  <Link href={`/vendors/${(purchaseOrder.vendorId as any)._id}`} className="text-primary hover:underline">
                    {vendorName}
                  </Link>
                ) : vendorName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Duration</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {new Date(purchaseOrder.startDate).toLocaleDateString()} to {new Date(purchaseOrder.endDate).toLocaleDateString()}
              </dd>
            </div>
            {purchaseOrder.issuedDate && (
              <div>
                <dt className="text-slate-500">Issued On</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {new Date(purchaseOrder.issuedDate).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {hasPermission('purchase_orders.manage') && (
          <Card className="p-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Actions</h3>
            <div className="space-y-3">
              {purchaseOrder.status === 'Draft' && (
                <Button className="w-full justify-center bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleUpdateStatus('Issued')} isLoading={isUpdatingStatus}>
                  Issue PO
                </Button>
              )}
              {purchaseOrder.status === 'Issued' && (
                <Button className="w-full justify-center bg-green-600 text-white hover:bg-green-700" onClick={() => handleUpdateStatus('Accepted')} isLoading={isUpdatingStatus}>
                  Mark as Accepted
                </Button>
              )}
              {(purchaseOrder.status === 'Draft' || purchaseOrder.status === 'Issued') && (
                <Button className="w-full justify-center bg-red-600 text-white hover:bg-red-700" onClick={() => handleUpdateStatus('Cancelled')} isLoading={isUpdatingStatus}>
                  Cancel PO
                </Button>
              )}
              {purchaseOrder.status === 'Accepted' && (
                <p className="text-sm text-slate-500">This PO has been accepted and locked.</p>
              )}
              {purchaseOrder.status === 'Cancelled' && (
                <p className="text-sm text-slate-500">This PO has been cancelled.</p>
              )}
            </div>
          </Card>
        )}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Line Items ({purchaseOrder.sites.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800/50 dark:text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Site Code</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Base Cost</th>
                <th className="px-4 py-3 font-medium text-right">Negotiated Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {purchaseOrder.sites.map((item: any, i: number) => {
                const site = item.siteId;
                return (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium">
                      {site.siteCode ? (
                        <Link href={`/sites/${site._id}`} className="text-primary hover:underline">{site.siteCode}</Link>
                      ) : 'Unknown'}
                    </td>
                    <td className="px-4 py-3">{site.city || 'N/A'}</td>
                    <td className="px-4 py-3">₹{site.baseCostPerDay || '0'}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{item.negotiatedRate}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Total Amount:</td>
                <td className="px-4 py-3 text-right font-semibold text-primary text-lg">₹{purchaseOrder.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

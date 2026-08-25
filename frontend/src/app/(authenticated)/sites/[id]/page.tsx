'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSite } from '@/modules/sites/hooks/use-sites';
import { Card, Badge, Spinner, Button } from '@/shared/ui';
import { useAuth } from '@/shared/auth/auth-context';

export default function SiteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { site, isLoading, error } = useSite(id);
  const { hasPermission } = useAuth();

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (error || !site) return <div className="p-8 text-red-500">{error || 'Site not found'}</div>;

  const vendorName = typeof site.vendorId === 'object' && site.vendorId !== null ? (site.vendorId as any).name : 'N/A';
  const vendorCity = typeof site.vendorId === 'object' && site.vendorId !== null ? (site.vendorId as any).city : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            {site.siteCode}
            <Badge>
              {site.status}
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 mt-1">{site.city} &bull; {site.type}</p>
        </div>
        <div className="flex gap-2">
          {hasPermission('sites.manage') && (
            <Link href={`/sites/${site._id || site.id}/edit`}>
              <Button variant="secondary">Edit Site</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Site Information</h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Address</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{site.address}</dd>
            </div>
            {site.gps && (
              <div>
                <dt className="text-slate-500">GPS Coordinates</dt>
                <dd className="font-medium text-primary hover:underline">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.gps)}`} target="_blank" rel="noopener noreferrer">
                    {site.gps} ↗
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-slate-500">Dimensions</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {site.width && site.height ? `${site.width}ft x ${site.height}ft` : 'N/A'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Commercial & Vendor</h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Base Cost Per Day</dt>
              <dd className="font-medium text-slate-900 dark:text-white">₹{site.baseCostPerDay}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Vendor</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {typeof site.vendorId === 'object' ? (
                  <Link href={`/vendors/${(site.vendorId as any)._id || (site.vendorId as any).id}`} className="text-primary hover:underline">
                    {vendorName} ({vendorCity})
                  </Link>
                ) : (
                  vendorName
                )}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Photos</h3>
        <div className="text-sm text-slate-500">No photos available.</div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Availability & Bookings</h3>
        <SiteCalendar siteId={id} />
      </Card>
    </div>
  );
}

function SiteCalendar({ siteId }: { siteId: string }) {
  const [monthOffset, setMonthOffset] = useState(0);
  
  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  
  // start of month
  const fromDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0];
  // end of month
  const toDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const { bookings, isLoading, error } = require('@/modules/sites/hooks/use-sites').useSiteCalendar(siteId, fromDate, toDate);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {targetDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setMonthOffset(prev => prev - 1)}>&larr; Prev</Button>
          <Button variant="secondary" onClick={() => setMonthOffset(prev => prev + 1)}>Next &rarr;</Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-4 flex justify-center"><Spinner /></div>
      ) : error ? (
        <div className="p-4 text-red-500 text-sm">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          {bookings && bookings.length > 0 ? (
            <ul className="space-y-2">
              {bookings.map((b: any, i: number) => (
                <li key={i} className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium text-primary">{b.campaignName}</span>
                    <Badge>{b.status}</Badge>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    PO: {b.poNumber} &bull; {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-md">
              No bookings in this month.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

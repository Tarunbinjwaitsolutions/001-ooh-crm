'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, SelectField, TextAreaField, Card, Spinner } from '../../../shared/ui';
import { sitesApi } from '../api';
import { vendorsApi } from '../../vendors/api';
import type { Site } from '../types';
import type { Vendor } from '../../vendors/types';

export function SiteForm({ initialData }: { initialData?: Site }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);

  useEffect(() => {
    vendorsApi.getVendors({ limit: '1000' })
      .then(res => setVendors(res.data))
      .catch(() => setError('Failed to load vendors'))
      .finally(() => setIsLoadingVendors(false));
  }, []);

  const [formData, setFormData] = useState({
    siteCode: initialData?.siteCode || '',
    city: initialData?.city || '',
    type: initialData?.type || 'Other',
    address: initialData?.address || '',
    gps: initialData?.gps || '',
    width: initialData?.width?.toString() || '',
    height: initialData?.height?.toString() || '',
    baseCostPerDay: initialData?.baseCostPerDay?.toString() || '',
    vendorId: initialData ? (typeof initialData.vendorId === 'string' ? initialData.vendorId : initialData.vendorId._id || initialData.vendorId.id) : '',
    status: initialData?.status || 'Active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      width: formData.width ? Number(formData.width) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      baseCostPerDay: Number(formData.baseCostPerDay),
    };

    try {
      if (initialData) {
        await sitesApi.updateSite(initialData._id || initialData.id, payload);
        router.push(`/sites/${initialData._id || initialData.id}`);
      } else {
        const site = await sitesApi.createSite(payload);
        router.push(`/sites/${site._id || site.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save site');
      setIsSubmitting(false);
    }
  };

  if (isLoadingVendors) {
    return <div className="p-8 flex justify-center"><Spinner /></div>;
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Site Code"
            required
            value={formData.siteCode}
            onChange={(e) => setFormData({ ...formData, siteCode: e.target.value })}
          />
          <Field
            label="City"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <SelectField
            label="Site Type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Site['type'] })}
            options={[
              { label: 'Airport', value: 'Airport' },
              { label: 'Highway', value: 'Highway' },
              { label: 'Mall', value: 'Mall' },
              { label: 'Metro', value: 'Metro' },
              { label: 'Market', value: 'Market' },
              { label: 'Other', value: 'Other' },
            ]}
          />
          <SelectField
            label="Vendor"
            required
            value={formData.vendorId}
            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
            options={[
              { label: 'Select a vendor...', value: '' },
              ...vendors.map(v => ({ label: `${v.name} (${v.city})`, value: v._id || v.id }))
            ]}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              label="Address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <Field
            label="GPS Coordinates (Latitude, Longitude)"
            placeholder="e.g. 19.0760, 72.8777"
            value={formData.gps}
            onChange={(e) => setFormData({ ...formData, gps: e.target.value })}
          />
          <Field
            label="Base Cost Per Day (₹)"
            type="number"
            min="0"
            required
            value={formData.baseCostPerDay}
            onChange={(e) => setFormData({ ...formData, baseCostPerDay: e.target.value })}
          />
          <Field
            label="Width (ft)"
            type="number"
            min="0"
            value={formData.width}
            onChange={(e) => setFormData({ ...formData, width: e.target.value })}
          />
          <Field
            label="Height (ft)"
            type="number"
            min="0"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
          />
          <SelectField
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Site['status'] })}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Maintenance', value: 'Maintenance' },
              { label: 'Inactive', value: 'Inactive' },
            ]}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Update Site' : 'Create Site'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

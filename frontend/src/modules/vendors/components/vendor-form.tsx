'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, FieldWrapper, Card, Spinner } from '../../../shared/ui';
import { vendorsApi } from '../api';
import type { Vendor } from '../types';
import { useAuth } from '../../../shared/auth/auth-context';

export function VendorForm({ initialData }: { initialData?: Vendor }) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    city: initialData?.city || '',
    siteOwnerName: initialData?.siteOwnerName || '',
    contactPerson: initialData?.contactPerson || '',
    mobile: initialData?.mobile || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    gstNumber: initialData?.gstNumber || '',
    paymentTerms: initialData?.paymentTerms || '',
    bankAccount: initialData?.bankAccount || '',
    ifscCode: initialData?.ifscCode || '',
    status: initialData?.status || 'Active',
  });

  const canManageBank = hasPermission('finance.bank_details');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (initialData) {
        await vendorsApi.updateVendor(initialData._id || initialData.id, formData);
        router.push(`/vendors/${initialData._id || initialData.id}`);
      } else {
        const vendor = await vendorsApi.createVendor(formData);
        router.push(`/vendors/${vendor._id || vendor.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save vendor');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}
        
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldWrapper label="Vendor Name" required>
            <input
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FieldWrapper>
          <FieldWrapper label="City" required>
            <input
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </FieldWrapper>
          <FieldWrapper label="Site Owner Name" required>
            <input
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.siteOwnerName}
              onChange={(e) => setFormData({ ...formData, siteOwnerName: e.target.value })}
            />
          </FieldWrapper>
          <FieldWrapper label="Contact Person" required>
            <input
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
          </FieldWrapper>
          <FieldWrapper label="Mobile" required>
            <input
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </FieldWrapper>
          <FieldWrapper label="Email">
            <input
              type="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FieldWrapper>
          <div className="sm:col-span-2">
            <FieldWrapper label="Address" required>
              <textarea
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </FieldWrapper>
          </div>
          <FieldWrapper label="GST Number">
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            />
          </FieldWrapper>
          <FieldWrapper label="Payment Terms">
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            />
          </FieldWrapper>
          
          {canManageBank && (
            <>
              <FieldWrapper label="Bank Account">
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                />
              </FieldWrapper>
              <FieldWrapper label="IFSC Code">
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                />
              </FieldWrapper>
            </>
          )}

          <FieldWrapper label="Status">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </FieldWrapper>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Field, SelectField, Button, Alert } from '@/shared/ui';
import { leadsApi } from '@/modules/leads/api';
import { LeadSource } from '@/modules/leads/types';

const SOURCES: { label: string; value: LeadSource }[] = [
  { label: 'JustDial', value: 'JustDial' },
  { label: 'Website', value: 'Website' },
  { label: 'WhatsApp', value: 'WhatsApp' },
  { label: 'Facebook', value: 'Facebook' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'Email', value: 'Email' },
  { label: 'Referral', value: 'Referral' },
  { label: 'Manual', value: 'Manual' },
];

export default function NewLeadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Field-level validations can be simple for now
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      source: formData.get('source') as LeadSource,
      companyName: formData.get('companyName') as string,
      contactPerson: formData.get('contactPerson') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
      city: formData.get('city') as string,
    };

    // Basic frontend validation
    const newErrors: Record<string, string> = {};
    if (!data.source) newErrors.source = 'Source is required';
    if (!data.companyName) newErrors.companyName = 'Company name is required';
    if (!data.contactPerson) newErrors.contactPerson = 'Contact person is required';
    if (!data.mobile) newErrors.mobile = 'Mobile is required';
    if (!data.city) newErrors.city = 'City is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const lead = await leadsApi.createLead(data);
      router.push(`/leads/${lead._id || lead.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">New Lead</h1>
      
      {error && (
        <div className="mb-6">
          <Alert tone="error" title="Submission Failed">
            {error}
          </Alert>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SelectField
              label="Source"
              name="source"
              options={SOURCES}
              placeholder="Select source..."
              error={errors.source}
              defaultValue="Manual"
            />
            
            <Field
              label="Company Name"
              name="companyName"
              placeholder="e.g. Media Octus"
              error={errors.companyName}
            />

            <Field
              label="Contact Person"
              name="contactPerson"
              placeholder="e.g. Jane Doe"
              error={errors.contactPerson}
            />

            <Field
              label="Mobile Number"
              name="mobile"
              type="tel"
              placeholder="+91..."
              error={errors.mobile}
            />

            <Field
              label="Email Address"
              name="email"
              type="email"
              placeholder="jane@example.com"
              error={errors.email}
              hint="Optional"
            />

            <Field
              label="City"
              name="city"
              placeholder="e.g. Mumbai"
              error={errors.city}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Lead
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

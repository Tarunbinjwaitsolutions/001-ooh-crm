'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Field, SelectField, Alert } from '@/shared/ui';
import { useLeaveTypes, useLeaveBalance } from '@/modules/hr/hooks/use-leave';
import { leaveApi } from '@/modules/hr/api';

export default function ApplyLeavePage() {
  const router = useRouter();
  const { data: leaveTypes, isLoading: typesLoading } = useLeaveTypes();
  const { data: balances, isLoading: balancesLoading } = useLeaveBalance();
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    days: 1,
    reason: '',
  });

  const selectedType = leaveTypes?.find((t: any) => t.id === formData.leaveTypeId);
  const selectedBalance = balances?.find((b: any) => b.leaveType.id === formData.leaveTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await leaveApi.applyLeave(formData);
      router.push('/leave');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to auto-calculate days (excluding weekends could be added here in future)
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    if (s > e) return 0;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
  };

  const handleDateChange = (field: 'fromDate' | 'toDate', val: string) => {
    const updated = { ...formData, [field]: val };
    if (updated.fromDate && updated.toDate) {
      updated.days = calculateDays(updated.fromDate, updated.toDate);
    }
    setFormData(updated);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Apply Leave</h1>
        <p className="text-sm text-slate-500">Submit a new leave request for approval.</p>
      </div>

      <Card className="p-6">
        {error && <Alert tone="error">{error}</Alert>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <SelectField
            label="Leave Type"
            value={formData.leaveTypeId}
            onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
            options={[
              { label: 'Select Leave Type', value: '' },
              ...(leaveTypes?.map((t: any) => ({ label: `${t.name} (${t.code})`, value: t.id })) || [])
            ]}
            required
          />

          {selectedBalance && selectedType?.annualQuota! > 0 && (
            <div className={`p-4 rounded-lg flex justify-between ${
              selectedBalance.remaining >= formData.days 
                ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div>
                <span className="block text-sm font-medium opacity-80">Available Balance</span>
                <span className="text-xl font-bold">{selectedBalance.remaining} Days</span>
              </div>
              <div className="text-right">
                <span className="block text-sm font-medium opacity-80">Remaining After Request</span>
                <span className="text-xl font-bold">{selectedBalance.remaining - formData.days} Days</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field
              type="date"
              label="From Date"
              value={formData.fromDate}
              onChange={(e) => handleDateChange('fromDate', e.target.value)}
              required
            />
            <Field
              type="date"
              label="To Date"
              value={formData.toDate}
              onChange={(e) => handleDateChange('toDate', e.target.value)}
              required
            />
          </div>

          <Field
            type="number"
            label="Total Days"
            value={formData.days}
            onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
            required
            min={0.5}
            step={0.5}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={typesLoading || balancesLoading}>
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

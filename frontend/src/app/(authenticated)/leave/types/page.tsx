'use client';

import { useState } from 'react';
import { Card, Button, Spinner, Field, Badge, Alert } from '@/shared/ui';
import { useLeaveTypes } from '@/modules/hr/hooks/use-leave';
import { leaveApi } from '@/modules/hr/api';

export default function LeaveTypesPage() {
  const { data: leaveTypes, isLoading, mutate } = useLeaveTypes();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    annualQuota: 0,
    carryForward: false,
    maxCarryForward: 0,
    encashable: false,
    requiresDocument: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await leaveApi.createLeaveType(formData);
      await mutate();
      setShowForm(false);
      setFormData({
        name: '',
        code: '',
        annualQuota: 0,
        carryForward: false,
        maxCarryForward: 0,
        encashable: false,
        requiresDocument: false,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create leave type');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Leave Types</h1>
          <p className="text-sm text-slate-500">Manage leave policies and quotas.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Leave Type'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">New Leave Type</h3>
          {error && <Alert tone="error">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Field
                label="Code (e.g., SL, AL, LWP)"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
              <Field
                type="number"
                label="Annual Quota (Days)"
                value={formData.annualQuota}
                onChange={(e) => setFormData({ ...formData, annualQuota: Number(e.target.value) })}
                required
                min={0}
              />
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="carryForward"
                  checked={formData.carryForward}
                  onChange={(e) => setFormData({ ...formData, carryForward: e.target.checked })}
                />
                <label htmlFor="carryForward" className="text-sm text-slate-700">Carry Forward Allowed</label>
              </div>
              {formData.carryForward && (
                <Field
                  type="number"
                  label="Max Carry Forward"
                  value={formData.maxCarryForward}
                  onChange={(e) => setFormData({ ...formData, maxCarryForward: Number(e.target.value) })}
                  min={0}
                />
              )}
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="encashable"
                  checked={formData.encashable}
                  onChange={(e) => setFormData({ ...formData, encashable: e.target.checked })}
                />
                <label htmlFor="encashable" className="text-sm text-slate-700">Encashable</label>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="requiresDocument"
                  checked={formData.requiresDocument}
                  onChange={(e) => setFormData({ ...formData, requiresDocument: e.target.checked })}
                />
                <label htmlFor="requiresDocument" className="text-sm text-slate-700">Requires Document (e.g., Medical Cert)</label>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={submitting}>Create Leave Type</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Code</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Annual Quota</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Carry Forward</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveTypes?.map((type: any) => (
                  <tr key={type.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{type.name}</td>
                    <td className="px-4 py-3 text-slate-600">{type.code}</td>
                    <td className="px-4 py-3 text-slate-800">{type.annualQuota} days</td>
                    <td className="px-4 py-3 text-slate-600">
                      {type.carryForward ? `Yes (Max: ${type.maxCarryForward})` : 'No'}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {type.encashable && <Badge>Encashable</Badge>}
                      {type.requiresDocument && <Badge>Requires Doc</Badge>}
                    </td>
                  </tr>
                ))}
                {(!leaveTypes || leaveTypes.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No leave types configured. Add one above.
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

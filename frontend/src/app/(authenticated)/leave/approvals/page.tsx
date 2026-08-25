'use client';

import { useState } from 'react';
import { Card, Badge, Spinner, Button, Alert } from '@/shared/ui';
import { useTeamLeaveRequests } from '@/modules/hr/hooks/use-leave';
import { leaveApi } from '@/modules/hr/api';

export default function LeaveApprovalsPage() {
  const { data: requests, isLoading, mutate } = useTeamLeaveRequests();
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setError(null);
    try {
      await leaveApi.approveLeave(id);
      await mutate();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setProcessingId(id);
    setError(null);
    try {
      await leaveApi.rejectLeave(id, rejectionReason);
      setRejectingId(null);
      setRejectionReason('');
      await mutate();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Leave Approvals</h1>
        <p className="text-sm text-slate-500">Review and approve team leave requests.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Employee</th>
                <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 font-medium text-slate-600">Dates</th>
                <th className="px-4 py-3 font-medium text-slate-600">Days</th>
                <th className="px-4 py-3 font-medium text-slate-600">Reason</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests?.map((req: any) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {req.employeeId?.name || req.employeeId?.toString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {req.leaveTypeId?.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {req.days}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="px-4 py-3">
                    {rejectingId === req.id ? (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border rounded text-xs"
                          placeholder="Rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            onClick={() => handleReject(req.id)}
                            isLoading={processingId === req.id}
                          >
                            Confirm Reject
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => setRejectingId(null)}
                            disabled={processingId === req.id}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="primary" 
                          onClick={() => handleApprove(req.id)}
                          isLoading={processingId === req.id}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => setRejectingId(req.id)}
                          disabled={processingId === req.id}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!requests || requests.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No pending leave requests to review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

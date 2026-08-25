'use client';

import { Card, Badge, Spinner, Button } from '@/shared/ui';
import { useLeaveBalance, useMyLeaveRequests } from '@/modules/hr/hooks/use-leave';
import Link from 'next/link';

export default function MyLeavePage() {
  const { data: balance, isLoading: balanceLoading } = useLeaveBalance();
  const { data: requests, isLoading: requestsLoading } = useMyLeaveRequests();

  if (balanceLoading || requestsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">My Leave</h1>
          <p className="text-sm text-slate-500">View your leave balances and history.</p>
        </div>
        <Link href="/leave/new">
          <Button>Apply Leave</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {balance?.map((b: any) => (
          <Card key={b.leaveType.id} className="p-6">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">{b.leaveType.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Allocated:</span>
                <span className="font-medium text-slate-700">{b.allocated} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Used:</span>
                <span className="font-medium text-slate-700">{b.used} days</span>
              </div>
              {b.leaveType.carryForward && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Carried Forward:</span>
                  <span className="font-medium text-slate-700">{b.carriedForward} days</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-semibold">
                <span className="text-slate-800">Remaining:</span>
                <span className={b.remaining > 0 ? "text-green-600" : "text-red-500"}>
                  {b.remaining} days
                </span>
              </div>
            </div>
          </Card>
        ))}
        {(!balance || balance.length === 0) && (
          <div className="col-span-full text-slate-500 bg-slate-50 p-6 rounded-xl text-center">
            No leave balances found.
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Leave Requests</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-600">From Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600">To Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Days</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests?.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {req.leaveTypeId?.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(req.fromDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(req.toDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {req.days}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                  </tr>
                ))}
                {(!requests || requests.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, Badge, Spinner, Field } from '@/shared/ui';
import { useTeamAttendance } from '@/modules/hr/hooks/use-attendance';

export default function TeamAttendancePage() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  
  const { data: attendance, isLoading } = useTeamAttendance({ date: dateFilter });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Team Attendance</h1>
          <p className="text-sm text-slate-500">Monitor daily attendance for all employees.</p>
        </div>
        <div className="w-48">
          <Field
            type="date"
            label="Date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

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
                  <th className="px-4 py-3 font-medium text-slate-600">Employee</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Check In</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Check Out</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Hours</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Work Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance?.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {/* Placeholder until backend populates employeeId */}
                      {record.employeeId?.name || record.employeeId?.toString() || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '--:--'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '--:--'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {record.totalHours ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.workType}
                    </td>
                  </tr>
                ))}
                {(!attendance || attendance.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No attendance records found for this date.
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

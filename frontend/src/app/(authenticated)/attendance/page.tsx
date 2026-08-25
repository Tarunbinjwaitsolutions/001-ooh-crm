'use client';

import { useState } from 'react';
import { Card, Badge, Spinner } from '@/shared/ui';
import { useMyAttendance } from '@/modules/hr/hooks/use-attendance';

export default function MyAttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Basic filtering can be added here
  const { data: attendance, isLoading } = useMyAttendance();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">My Attendance</h1>
          <p className="text-sm text-slate-500">View your daily attendance records and hours.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
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
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No attendance records found.
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

/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Badge, Spinner, Button, SelectField, Field } from '@/shared/ui';
import { useMyAttendance, useTeamAttendance } from '@/modules/hr/hooks/use-attendance';
import { useAuth } from '@/shared/auth/auth-context';

function AttendanceTabsContent() {
  const { hasPermission } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState('my');

  // Sync tab from search parameters (redirects/bookmarks)
  useEffect(() => {
    if (tabParam && ['my', 'team', 'reports'].includes(tabParam)) {
      if (tabParam === 'my' || hasPermission('attendance.view_team')) {
        setActiveTab(tabParam);
      }
    }
  }, [tabParam, hasPermission]);

  // Tab definitions
  const tabs = [
    { id: 'my', label: 'My Attendance', permission: 'attendance.self' },
    ...(hasPermission('attendance.view_team')
      ? [
          { id: 'team', label: 'Team Attendance' },
          { id: 'reports', label: 'Attendance Reports' },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-500">Track and manage attendance records.</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-[#6E1D1D] text-[#6E1D1D] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'my' && <MyAttendanceTab />}
        {activeTab === 'team' && hasPermission('attendance.view_team') && <TeamAttendanceTab />}
        {activeTab === 'reports' && hasPermission('attendance.view_team') && <AttendanceReportsTab />}
      </div>
    </div>
  );
}

// ------------------------------------------------------------- My Attendance Tab
function MyAttendanceTab() {
  const { data: attendance, isLoading } = useMyAttendance();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
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
                  <Badge>{record.status}</Badge>
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
                <td className="px-4 py-3 text-slate-600">{record.workType}</td>
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
  );
}

// ----------------------------------------------------------- Team Attendance Tab
function TeamAttendanceTab() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const { data: attendance, isLoading } = useTeamAttendance({ date: dateFilter });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-800">Team Attendance Monitor</h2>
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
                      {record.employeeId?.name || record.employeeId?.toString() || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{record.status}</Badge>
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
                    <td className="px-4 py-3 text-slate-600">{record.workType}</td>
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

// ---------------------------------------------------------- Attendance Reports Tab
function AttendanceReportsTab() {
  const [reportType, setReportType] = useState('monthly-register');
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: attendance, isLoading } = useTeamAttendance({
    startDate,
    endDate,
  });

  const generateDaysArray = () => {
    const arr = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      arr.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return arr;
  };

  const days = generateDaysArray();

  // Group attendance by employee
  const employeeMap = new Map<string, any>();
  attendance?.forEach((record) => {
    const empId = record.employeeId?.id || record.employeeId?.toString() || 'unknown';
    if (!employeeMap.has(empId)) {
      employeeMap.set(empId, {
        name: record.employeeId?.name || empId,
        department: record.employeeId?.department || 'General',
        records: {},
      });
    }
    const dateStr = new Date(record.date).toISOString().split('T')[0];
    employeeMap.get(empId).records[dateStr] = record;
  });

  const employees = Array.from(employeeMap.values());

  const handleExportCSV = () => {
    let csv = 'Employee,Department,';
    csv += days.join(',') + '\n';

    employees.forEach((emp) => {
      let row = `"${emp.name}","${emp.department}",`;
      const rowData = days.map((day) => {
        const record = emp.records[day];
        if (!record) return 'Absent';
        if (record.status === 'Present') return 'P';
        if (record.status === 'Absent') return 'A';
        if (record.status === 'Half-Day') return 'HD';
        if (record.status === 'Late') return 'L';
        if (record.status === 'Leave') return 'LV';
        return record.status;
      });
      row += rowData.join(',') + '\n';
      csv += row;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_register_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-slate-800">Attendance Data Exporter</h2>
        <p className="text-sm text-slate-500">Generate and export HR attendance data.</p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <SelectField
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { label: 'Monthly Attendance Register', value: 'monthly-register' },
              { label: 'Daily Attendance Summary', value: 'daily-summary' },
              { label: 'Late Arrival Report', value: 'late-arrival' },
              { label: 'Absence Report', value: 'absence' },
            ]}
          />
          <Field
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Field
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={handleExportCSV} disabled={isLoading || !attendance?.length}>
            Export CSV
          </Button>
        </div>
      </Card>

      {reportType === 'monthly-register' && (
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 font-medium text-slate-600 sticky left-0 bg-slate-50 z-20 border-r border-slate-200">
                      Employee
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        className="px-2 py-2 font-medium text-slate-600 text-center border-l border-slate-200"
                      >
                        {new Date(day).getDate()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-800 sticky left-0 bg-white shadow-[1px_0_0_0_#e2e8f0] border-r border-slate-200">
                        {emp.name}
                      </td>
                      {days.map((day) => {
                        const record = emp.records[day];
                        let bg = 'bg-white';
                        let text = 'text-slate-300';
                        let label = '-';

                        if (record) {
                          if (record.status === 'Present') {
                            bg = 'bg-green-50';
                            text = 'text-green-700 font-medium';
                            label = 'P';
                          } else if (record.status === 'Absent') {
                            bg = 'bg-red-50';
                            text = 'text-red-700 font-medium';
                            label = 'A';
                          } else if (record.status === 'Half-Day') {
                            bg = 'bg-yellow-50';
                            text = 'text-yellow-700 font-medium';
                            label = 'HD';
                          } else if (record.status === 'Late') {
                            bg = 'bg-orange-50';
                            text = 'text-orange-700 font-medium';
                            label = 'L';
                          } else if (record.status === 'Leave') {
                            bg = 'bg-blue-50';
                            text = 'text-blue-700 font-medium';
                            label = 'LV';
                          }
                        }

                        return (
                          <td
                            key={day}
                            className={`px-2 py-2 text-center border-l border-slate-100 ${bg} ${text}`}
                          >
                            {label}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={days.length + 1} className="px-4 py-8 text-center text-slate-500">
                        No attendance data available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <AttendanceTabsContent />
    </Suspense>
  );
}

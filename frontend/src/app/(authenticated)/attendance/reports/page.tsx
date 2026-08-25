'use client';

import { useState } from 'react';
import { Card, Button, SelectField, Field, Spinner } from '@/shared/ui';
import { useTeamAttendance } from '@/modules/hr/hooks/use-attendance';

export default function AttendanceReportsPage() {
  const [reportType, setReportType] = useState('monthly-register');
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // For the monthly register we pull attendance for the date range
  // In a real production app, this would use a dedicated report endpoint to avoid loading thousands of records
  const { data: attendance, isLoading } = useTeamAttendance({
    startDate,
    endDate,
  });

  const generateDaysArray = () => {
    const arr = [];
    let current = new Date(startDate);
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
  attendance?.forEach(record => {
    const empId = record.employeeId?.id || record.employeeId?.toString() || 'unknown';
    if (!employeeMap.has(empId)) {
      employeeMap.set(empId, {
        name: record.employeeId?.name || empId,
        department: record.employeeId?.department || 'General',
        records: {}
      });
    }
    const dateStr = new Date(record.date).toISOString().split('T')[0];
    employeeMap.get(empId).records[dateStr] = record;
  });

  const employees = Array.from(employeeMap.values());

  const handleExportCSV = () => {
    let csv = 'Employee,Department,';
    csv += days.join(',') + '\n';

    employees.forEach(emp => {
      let row = `"${emp.name}","${emp.department}",`;
      const rowData = days.map(day => {
        const record = emp.records[day];
        if (!record) return 'Absent'; // Or 'Holiday' based on logic
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
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Attendance Reports</h1>
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
                    <th className="px-3 py-2 font-medium text-slate-600 sticky left-0 bg-slate-50 z-20">Employee</th>
                    {days.map(day => (
                      <th key={day} className="px-2 py-2 font-medium text-slate-600 text-center border-l border-slate-200">
                        {new Date(day).getDate()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-800 sticky left-0 bg-white shadow-[1px_0_0_0_#e2e8f0]">
                        {emp.name}
                      </td>
                      {days.map(day => {
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
                          <td key={day} className={`px-2 py-2 text-center border-l border-slate-100 ${bg} ${text}`}>
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

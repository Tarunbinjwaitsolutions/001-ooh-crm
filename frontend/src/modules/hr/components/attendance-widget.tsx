import { useState } from 'react';
import { Card, Button, Badge, Spinner, Alert, SelectField } from '@/shared/ui';
import { useMyAttendance } from '../hooks/use-attendance';
import { attendanceApi } from '../api';
import { WorkType } from '../types';

export function AttendanceWidget() {
  const { data: attendance, isLoading, mutate } = useMyAttendance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workType, setWorkType] = useState<WorkType>('Office');

  // Find today's attendance record
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendance?.find((r) => r.date.startsWith(today));

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setLoading(true);
    setError(null);
    try {
      let gps: { lat: number; lng: number } | undefined;
      let gpsFlag = false;

      // Try to get GPS
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          gps = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (err) {
          console.warn('GPS unavailable:', err);
          gpsFlag = true;
        }
      } else {
        gpsFlag = true;
      }

      if (action === 'check-in') {
        await attendanceApi.checkIn({ gps, workType, deviceInfo: navigator.userAgent });
      } else {
        await attendanceApi.checkOut({ gps });
      }

      await mutate();
      if (gpsFlag) {
        // Optional: show a toast or note about GPS failure, but do not block
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || `Failed to ${action}`);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <Spinner />;

  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Attendance</h3>
        {todayRecord?.status && (
          <Badge>
            {todayRecord.status}
          </Badge>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-slate-500 mb-1">Check In</p>
          <p className="font-medium text-slate-800">
            {todayRecord?.checkInTime ? new Date(todayRecord.checkInTime).toLocaleTimeString() : '--:--'}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-slate-500 mb-1">Check Out</p>
          <p className="font-medium text-slate-800">
            {todayRecord?.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString() : '--:--'}
          </p>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="text-slate-500 text-sm mb-1">Total Hours</p>
        <p className="font-medium text-slate-800 text-lg">{todayRecord?.totalHours ?? '0.00'} hrs</p>
      </div>

      {!isCheckedIn && (
        <div className="space-y-3">
          <SelectField
            label="Work Type"
            value={workType}
            onChange={(e) => setWorkType(e.target.value as WorkType)}
            options={[
              { label: 'Office', value: 'Office' },
              { label: 'Remote', value: 'Remote' },
              { label: 'Field Visit', value: 'Field Visit' },
            ]}
          />
          <Button
            className="w-full"
            variant="primary"
            onClick={() => handleAction('check-in')}
            isLoading={loading}
          >
            Check In
          </Button>
        </div>
      )}

      {isCheckedIn && !isCheckedOut && (
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => handleAction('check-out')}
          isLoading={loading}
        >
          Check Out
        </Button>
      )}

      {isCheckedOut && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-center font-medium">
          Attendance completed for today.
        </div>
      )}
    </Card>
  );
}

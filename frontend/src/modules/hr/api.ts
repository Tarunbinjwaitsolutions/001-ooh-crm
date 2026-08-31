import { api } from '@/shared/api/client';
import { Attendance, LeaveType, LeaveRequest, LeaveBalance, WorkType, Holiday } from './types';

export const attendanceApi = {
  checkIn: async (data: { gps?: { lat: number; lng: number }; workType?: WorkType; deviceInfo?: string }) => {
    const res = await api.post<Attendance>('/attendance/check-in', data);
    return res;
  },
  checkOut: async (data: { gps?: { lat: number; lng: number } }) => {
    const res = await api.post<Attendance>('/attendance/check-out', data);
    return res;
  },
  getMyAttendance: async (params?: Record<string, any>) => {
    const res = await api.get<Attendance[]>('/attendance/me', { skipAuth: false });
    return res;
  },
  getTeamAttendance: async (params?: Record<string, any>) => {
    const res = await api.get<Attendance[]>('/attendance/team', { skipAuth: false });
    return res;
  },
};

export const leaveApi = {
  getLeaveTypes: async () => {
    const res = await api.get<{ leaveTypes: LeaveType[] }>('/api/leave-types?pageSize=100');
    return res.leaveTypes;
  },
  createLeaveType: async (data: Partial<LeaveType>) => {
    const res = await api.post<{ leaveType: LeaveType }>('/api/leave-types', {
      name: data.name,
      code: data.code,
      annualQuota: data.annualQuota ?? null,
      carryForward: data.carryForward ?? false,
      maxCarryForward: data.maxCarryForward ?? 0,
      encashable: data.encashable ?? false,
      requiresDocument: data.requiresDocument ?? false,
    });
    return res.leaveType;
  },
  updateLeaveType: async (id: string, data: Partial<LeaveType>) => {
    const res = await api.patch<{ leaveType: LeaveType }>(`/api/leave-types/${id}`, data);
    return res.leaveType;
  },
  deleteLeaveType: async (id: string) => {
    const res = await api.delete<{ message: string; leaveType: LeaveType }>(`/api/leave-types/${id}`);
    return res.leaveType;
  },
  getBalance: async (employeeId: string, year = new Date().getFullYear()) => {
    const res = await api.get<{ balances: LeaveBalance[] }>(`/api/employees/${employeeId}/leave-balance?year=${year}`);
    return res.balances;
  },
  applyLeave: async (data: any) => {
    const res = await api.post<LeaveRequest>('/api/leave-requests', data);
    return res;
  },
  getMyRequests: async () => {
    const res = await api.get<LeaveRequest[]>('/api/leave-requests/me');
    return res;
  },
  getTeamRequests: async () => {
    const res = await api.get<LeaveRequest[]>('/api/leave-requests/team');
    return res;
  },
  approveLeave: async (id: string) => {
    const res = await api.post<LeaveRequest>(`/api/leave-requests/${id}/approve`);
    return res;
  },
  rejectLeave: async (id: string, rejectionReason: string) => {
    const res = await api.post<LeaveRequest>(`/api/leave-requests/${id}/reject`, { status: 'Rejected', rejectionReason });
    return res;
  },
};

export const holidayApi = {
  getHolidays: async () => {
    const res = await api.get<Holiday[]>('/api/holidays');
    return res;
  },
  createHoliday: async (data: { name: string; date: string; description?: string }) => {
    const res = await api.post<Holiday>('/api/holidays', data);
    return res;
  },
  updateHoliday: async (id: string, data: { name: string; date: string; description?: string }) => {
    const res = await api.put<Holiday>(`/api/holidays/${id}`, data);
    return res;
  },
  deleteHoliday: async (id: string) => {
    const res = await api.delete<{ message: string; holiday: Holiday }>(`/api/holidays/${id}`);
    return res;
  },
};


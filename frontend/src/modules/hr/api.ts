import { api } from '@/shared/api/client';
import { Attendance, LeaveType, LeaveRequest, LeaveBalance, WorkType } from './types';

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
    const res = await api.get<LeaveType[]>('/leave/types');
    return res;
  },
  createLeaveType: async (data: Partial<LeaveType>) => {
    const res = await api.post<LeaveType>('/leave/types', data);
    return res;
  },
  getBalance: async () => {
    const res = await api.get<LeaveBalance[]>('/leave/balance');
    return res;
  },
  applyLeave: async (data: any) => {
    const res = await api.post<LeaveRequest>('/leave/apply', data);
    return res;
  },
  getMyRequests: async () => {
    const res = await api.get<LeaveRequest[]>('/leave/me');
    return res;
  },
  getTeamRequests: async () => {
    const res = await api.get<LeaveRequest[]>('/leave/team');
    return res;
  },
  approveLeave: async (id: string) => {
    const res = await api.post<LeaveRequest>(`/leave/${id}/approve`);
    return res;
  },
  rejectLeave: async (id: string, rejectionReason: string) => {
    const res = await api.post<LeaveRequest>(`/leave/${id}/reject`, { rejectionReason });
    return res;
  },
};

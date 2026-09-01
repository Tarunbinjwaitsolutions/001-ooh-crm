import { api } from '@/shared/api/client';
import { Attendance, LeaveType, LeaveRequest, LeaveBalance, WorkType, Candidate, CandidateStatus, CandidateListQuery } from './types';

export const attendanceApi = {
  checkIn: async (data: { gps?: { lat: number; lng: number }; workType?: WorkType; deviceInfo?: string }) => {
    const res = await api.post<Attendance>('/api/attendance/check-in', data);
    return res;
  },
  checkOut: async (data: { gps?: { lat: number; lng: number } }) => {
    const res = await api.post<Attendance>('/api/attendance/check-out', data);
    return res;
  },
  getMyAttendance: async (params?: Record<string, string | number | boolean>) => {
    const res = await api.get<Attendance[]>('/api/attendance/me', { skipAuth: false });
    return res;
  },
  getMyAttendanceSummary: async (month: number, year: number) => {
    const res = await api.get<{
      records: (Attendance & { regularHours?: number; overtime?: number })[];
      stats: { presentCount: number; absentCount: number; leaveHalfCount: number; totalWorkHours: number; };
    }>(`/api/attendance/me/summary?month=${month}&year=${year}`, { skipAuth: false });
    return res;
  },
  getTeamAttendance: async (params?: Record<string, string | number | boolean>) => {
    const res = await api.get<Attendance[]>('/api/attendance/team', { skipAuth: false });
    return res;
  },
};

export const leaveApi = {
  getLeaveTypes: async () => {
    const res = await api.get<LeaveType[]>('/api/leave/types');
    return res;
  },
  createLeaveType: async (data: Partial<LeaveType>) => {
    const res = await api.post<LeaveType>('/api/leave/types', data);
    return res;
  },
  getBalance: async () => {
    const res = await api.get<LeaveBalance[]>('/api/leave/balance');
    return res;
  },
  applyLeave: async (data: Record<string, unknown>) => {
    const res = await api.post<LeaveRequest>('/api/leave/apply', data);
    return res;
  },
  getMyRequests: async () => {
    const res = await api.get<LeaveRequest[]>('/api/leave/me');
    return res;
  },
  getTeamRequests: async () => {
    const res = await api.get<LeaveRequest[]>('/api/leave/team');
    return res;
  },
  approveLeave: async (id: string) => {
    const res = await api.post<LeaveRequest>(`/api/leave/${id}/approve`);
    return res;
  },
  rejectLeave: async (id: string, rejectionReason: string) => {
    const res = await api.post<LeaveRequest>(`/api/leave/${id}/reject`, { rejectionReason });
    return res;
  },
};

export const reportsApi = {
  getDailySummary: async (date: string) => {
    return await api.get<Attendance[]>(`/api/reports/attendance/daily?date=${date}`);
  },
  getLateReport: async (fromDate: string, toDate: string) => {
    return await api.get<Attendance[]>(`/api/reports/attendance/late?fromDate=${fromDate}&toDate=${toDate}`);
  },
  getMonthlyRegister: async (fromMonth: number, fromYear: number, toMonth?: number, toYear?: number) => {
    const tm = toMonth ?? fromMonth;
    const ty = toYear ?? fromYear;
    return await api.get<unknown[]>(
      `/api/reports/attendance/monthly?fromMonth=${fromMonth}&fromYear=${fromYear}&toMonth=${tm}&toYear=${ty}`
    );
  },
  getAbsenceReport: async (fromDate: string, toDate: string) => {
    return await api.get<unknown[]>(`/api/reports/attendance/absence?fromDate=${fromDate}&toDate=${toDate}`);
  },
};

export const candidatesApi = {
  list: async (query?: CandidateListQuery) => {
    const params = new URLSearchParams();
    if (query) {
      if (query.status) params.set('status', query.status);
      if (query.position) params.set('position', query.position);
      if (query.search) params.set('search', query.search);
      if (query.startDate) params.set('startDate', query.startDate);
      if (query.endDate) params.set('endDate', query.endDate);
      if (query.page) params.set('page', String(query.page));
      if (query.pageSize) params.set('pageSize', String(query.pageSize));
      if (query.sortBy) params.set('sortBy', query.sortBy);
      if (query.sortDir) params.set('sortDir', query.sortDir);
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await api.get<{ data: Candidate[]; total: number; page: number; pageSize: number }>(
      `/api/candidates${qs}`
    );
  },

  getById: async (id: string) => {
    return await api.get<{ data: Candidate }>(`/api/candidates/${id}`);
  },

  create: async (formData: FormData) => {
    return await api.post<{ data: Candidate }>('/api/candidates', formData);
  },

  update: async (id: string, data: { status?: CandidateStatus; notes?: string }) => {
    return await api.patch<{ data: Candidate }>(`/api/candidates/${id}`, data);
  },
};

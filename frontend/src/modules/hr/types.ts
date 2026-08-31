export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Break' | 'Half-Day' | 'Late';
export type WorkType = 'Office' | 'Remote' | 'Field Visit';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface IGps {
  lat: number;
  lng: number;
}

export interface Attendance {
  id: string;
  _id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  employeeId: any;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInGps?: IGps;
  checkOutGps?: IGps;
  totalHours?: number;
  workType: WorkType;
  status: AttendanceStatus;
  deviceInfo?: string;
}

export interface LeaveType {
  id: string;
  _id?: string;
  name: string;
  code: string;
  annualQuota: number | null;
  carryForward: boolean;
  maxCarryForward: number;
  encashable: boolean;
  requiresDocument: boolean;
  status: 'Active' | 'Inactive';
}

export interface LeaveRequest {
  id: string;
  _id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  employeeId: any;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  documentUrl?: string;
  approverId?: string;
  rejectionReason?: string;
  approvedAt?: string | null;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  leaveTypeName?: string;
  allocated?: number;
  used?: number;
  remaining?: number;
  attendance?: Array<{
    id: string;
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;
    status: string;
    workType: WorkType;
  }>;
  createdAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  allocated: number;
  used: number;
  carriedForward: number;
  balance: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
}


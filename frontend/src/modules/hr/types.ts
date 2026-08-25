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
  annualQuota: number;
  carryForward: boolean;
  maxCarryForward: number;
  encashable: boolean;
  requiresDocument: boolean;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  _id?: string;
  employeeId: any;
  leaveTypeId: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  documentUrl?: string;
  approverId?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  allocated: number;
  used: number;
  carriedForward: number;
  remaining: number;
}

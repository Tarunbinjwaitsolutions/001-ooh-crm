/**
 * REFERENCE MODULE — types.
 *
 * These mirror the DTO the API returns (`employees.service.ts`). Keep them in
 * sync by hand; if a field is missing here it simply won't render, which is a
 * cheaper failure than a runtime crash.
 */

export const DEPARTMENTS = [
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Marketing',
  'Management',
] as const;

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern'] as const;

export const EMPLOYEE_STATUSES = ['Active', 'On Notice', 'Inactive', 'Resigned'] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  workEmail: string;
  personalEmail?: string;
  mobile: string;
  dateOfBirth: string | null;
  department: Department;
  designation: string;
  employmentType: EmploymentType;
  dateOfJoining: string;
  dateOfExit: string | null;
  reportingManager: { id: string; fullName: string; designation: string } | null;
  workLocation: string;
  status: EmployeeStatus;
  emergencyContact?: { name?: string; relationship?: string; mobile?: string };
  address?: string;
  createdAt: string;
  updatedAt: string;

  /**
   * Present only when the signed-in user holds `employees.sensitive`.
   * The server omits them entirely for everyone else — do not assume they exist.
   */
  panNumber?: string;
  aadhaarNumber?: string;
  bankAccountNumber?: string;
  ifsc?: string;
  /** Integer paise. Use `formatPaise` to display; never do maths on it in rupees. */
  annualCtc?: number;
}

export interface EmployeeListResponse {
  employees: Employee[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface EmployeeListQuery {
  search?: string;
  department?: Department | '';
  status?: EmployeeStatus | '';
  page?: number;
  pageSize?: number;
  sortBy?: 'fullName' | 'employeeCode' | 'dateOfJoining' | 'department';
  sortDir?: 'asc' | 'desc';
}

export interface ManagerOption {
  id: string;
  fullName: string;
  designation: string;
  employeeCode: string;
}

/** The shape the form produces. Money is in **rupees** here — the API converts. */
export interface EmployeeFormValues {
  fullName: string;
  workEmail: string;
  personalEmail: string;
  mobile: string;
  dateOfBirth: string;
  department: Department | '';
  designation: string;
  employmentType: EmploymentType;
  dateOfJoining: string;
  dateOfExit: string;
  reportingManagerId: string;
  workLocation: string;
  status: EmployeeStatus;
  panNumber: string;
  aadhaarNumber: string;
  bankAccountNumber: string;
  ifsc: string;
  annualCtcRupees: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactMobile: string;
  address: string;
}

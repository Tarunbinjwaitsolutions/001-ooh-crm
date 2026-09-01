// src/modules/attendance/attendance.service.ts
import Attendance from '../models/attendance.model.js';
import ShiftConfig from '../models/shift-config.model.js';
import type { RequestContext } from '../../../core/context.js';
import { employeeService } from '../../employees/employees.service.js';

// Din ki shuruaat (midnight) nikalne ke liye helper
function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function checkIn(
  data: { gps?: { lat: number; lng: number }; workType?: 'Office' | 'Remote' | 'Field Visit'; deviceInfo?: string },
  ctx: RequestContext
) {
  const today = startOfDay(new Date());
  const employeeId = ctx.user.id;

  // Pehle check karo aaj ka record already hai kya
  let record = await Attendance.findOne({ employeeId, date: today });

  if (record) {
    // Already check-in ho chuka hai — bas update kar do (dobara create mat karo)
    record.checkInTime = new Date();
    if (data.gps) record.checkInGps = data.gps;
    await record.save();
    return record;
  }

  // Naya record banao
  record = await Attendance.create({
    employeeId,
    date: today,
    checkInTime: new Date(),
    checkInGps: data.gps ?? undefined,
    workType: data.workType ?? 'Office',
    deviceInfo: data.deviceInfo,
    status: 'Present',
    createdBy: employeeId,
  });

  return record;
}

export async function checkOut(
  data: { gps?: { lat: number; lng: number } },
  ctx: RequestContext,
) {
  const today = startOfDay(new Date());
  const employeeId = ctx.user.id;

  const record = await Attendance.findOne({
    employeeId,
    date: today,
  });

  if (!record || !record.checkInTime) {
    const err: any = new Error(
      "Cannot check out — no check-in found for today",
    );
    err.status = 400;
    err.publicMessage =
      "Please check in first before checking out.";
    throw err;
  }

  record.checkOutTime = new Date();
  if (data.gps) record.checkOutGps = data.gps;

  // totalHours calculate karo
  const diffMs =
    record.checkOutTime.getTime() -
    record.checkInTime.getTime();
  record.totalHours = Number(
    (diffMs / (1000 * 60 * 60)).toFixed(2),
  );

  // Half-day check karo shift config se
  const employee =
    await getEmployeeWithDepartment(
      employeeId,
      ctx,
    );
  const shiftConfig =
    await ShiftConfig.findOne({
      department: employee?.department,
    });
  const threshold =
    shiftConfig?.halfDayThresholdHours ?? 4;

  if (record.totalHours < threshold) {
    record.status = "Half-Day";
  }

  record.updatedBy = employeeId as any;
  await record.save();

  return record;
}

export async function getMyAttendance(ctx: RequestContext, filters: Record<string, any> = {}) {
  return Attendance.find({ employeeId: ctx.user.id, deletedAt: null, ...filters }).sort({ date: -1 });
}

export async function getTeamAttendance(ctx: RequestContext, filters: Record<string, any> = {}) {
  // Yaha scoping layer use hogi jab poora core/scoping ready ho
  // Abhi ke liye simple version:
  return Attendance.find({ deletedAt: null, ...filters }).sort({ date: -1 });
}

// Get employee department info — used to determine half-day threshold
async function getEmployeeWithDepartment(
  employeeId: string,
  ctx: RequestContext,
) {
  try {
    const employee =
      await employeeService.getById(
        employeeId,
        ctx,
      );

    return {
      department: employee.department,
    };
  } catch (err) {
    // If employee lookup fails, return default
    console.error(
      `[Attendance] Failed to fetch employee ${employeeId}:`,
      err,
    );

    return { department: "General" };
  }
}
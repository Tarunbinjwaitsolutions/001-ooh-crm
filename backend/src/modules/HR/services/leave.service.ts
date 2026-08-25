import mongoose from 'mongoose';
import LeaveType from '../models/leave-type.model.js';
import LeaveRequest from '../models/leave-request.model.js';
import type { RequestContext } from '../../../core/context.js';

export async function createLeaveType(data: any, ctx: RequestContext) {
  return LeaveType.create({ ...data, createdBy: ctx.user.id });
}

export async function getLeaveTypes() {
  return LeaveType.find({ isActive: true });
}

export async function getLeaveBalance(employeeId: string) {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  
  const types = await LeaveType.find({ isActive: true });
  const approvedLeaves = await LeaveRequest.find({
    employeeId,
    status: 'Approved',
    fromDate: { $gte: startOfYear },
  });

  const balances = types.map((type) => {
    const used = approvedLeaves
      .filter((req) => req.leaveTypeId.toString() === type.id)
      .reduce((sum, req) => sum + req.days, 0);
    
    // Simplistic carry forward for now: assumes 0 carried forward unless computed from last year
    const carriedForward = 0;
    const allocated = type.annualQuota;
    const remaining = allocated + carriedForward - used;

    return {
      leaveType: type,
      allocated,
      used,
      carriedForward,
      remaining,
    };
  });

  return balances;
}

export async function applyLeave(data: any, ctx: RequestContext) {
  const { leaveTypeId, fromDate, toDate, days, reason, documentUrl } = data;
  const employeeId = ctx.user.id;

  // Validate balance if the leave type has an annual quota
  const leaveType = await LeaveType.findById(leaveTypeId);
  if (!leaveType) {
    const err: any = new Error('Leave type not found');
    err.status = 404;
    throw err;
  }

  // Only check balance if it's not a Leave Without Pay (LWP usually has 0 quota or is marked encashable=false, but for now we assume all types with quota > 0 are checked)
  if (leaveType.annualQuota > 0) {
    const balances = await getLeaveBalance(employeeId);
    const balance = balances.find((b) => b.leaveType.id === leaveTypeId.toString());
    
    // Also include pending requests in used calculation to prevent over-booking
    const pendingLeaves = await LeaveRequest.find({
      employeeId,
      leaveTypeId,
      status: 'Pending',
    });
    
    const pendingDays = pendingLeaves.reduce((sum, req) => sum + req.days, 0);

    if (balance && balance.remaining - pendingDays < days) {
      const err: any = new Error('Insufficient leave balance');
      err.status = 400;
      err.publicMessage = `You only have ${balance.remaining - pendingDays} days left for ${leaveType.name}.`;
      throw err;
    }
  }

  const request = await LeaveRequest.create({
    employeeId,
    leaveTypeId,
    fromDate,
    toDate,
    days,
    reason,
    documentUrl,
    createdBy: employeeId,
  });

  return request;
}

export async function getMyRequests(ctx: RequestContext) {
  return LeaveRequest.find({ employeeId: ctx.user.id })
    .populate('leaveTypeId')
    .sort({ createdAt: -1 });
}

export async function getTeamRequests(ctx: RequestContext) {
  // Simple version: return all pending requests for managers
  // A real implementation would filter by department or team structure
  return LeaveRequest.find({ status: 'Pending' })
    .populate('leaveTypeId')
    .populate('employeeId', 'name email department')
    .sort({ createdAt: 1 });
}

export async function approveLeave(id: string, ctx: RequestContext) {
  const request = await LeaveRequest.findById(id);
  if (!request) throw new Error('Request not found');

  if (request.employeeId.toString() === ctx.user.id) {
    const err: any = new Error('Cannot self-approve');
    err.status = 403;
    throw err;
  }

  request.status = 'Approved';
  request.approverId = ctx.user.id as any;
  request.updatedBy = ctx.user.id as any;
  await request.save();

  return request;
}

export async function rejectLeave(id: string, reason: string, ctx: RequestContext) {
  const request = await LeaveRequest.findById(id);
  if (!request) throw new Error('Request not found');

  if (request.employeeId.toString() === ctx.user.id) {
    const err: any = new Error('Cannot self-reject');
    err.status = 403;
    throw err;
  }

  request.status = 'Rejected';
  request.rejectionReason = reason;
  request.approverId = ctx.user.id as any;
  request.updatedBy = ctx.user.id as any;
  await request.save();

  return request;
}

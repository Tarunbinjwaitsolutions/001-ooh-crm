import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveType extends Document {
  name: string;
  code: string;
  annualQuota: number;
  carryForward: boolean;
  maxCarryForward: number;
  encashable: boolean;
  requiresDocument: boolean;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const leaveTypeSchema = new Schema<ILeaveType>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    annualQuota: { type: Number, required: true, min: 0 },
    carryForward: { type: Boolean, default: false },
    maxCarryForward: { type: Number, default: 0 },
    encashable: { type: Boolean, default: false },
    requiresDocument: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

export default mongoose.model<ILeaveType>('LeaveType', leaveTypeSchema);

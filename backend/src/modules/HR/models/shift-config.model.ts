// src/modules/attendance/shift-config.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IShiftConfig extends Document {
  department: string;
  startTime: string;   // "09:00"
  endTime: string;      // "18:00"
  graceMinutes: number;
  halfDayThresholdHours: number;
}

const shiftConfigSchema = new Schema<IShiftConfig>(
  {
    department: { type: String, required: true, unique: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    graceMinutes: { type: Number, default: 15 },
    halfDayThresholdHours: { type: Number, default: 4 },
  },
  { timestamps: true }
);

export default mongoose.model<IShiftConfig>('ShiftConfig', shiftConfigSchema);
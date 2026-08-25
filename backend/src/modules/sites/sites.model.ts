import mongoose, { Schema, Types } from 'mongoose';
import { basePlugin, type BaseDocument } from '../../core/db/basePlugin.js';

export const SITE_TYPES = ['Airport', 'Highway', 'Mall', 'Metro', 'Market', 'Other'] as const;
export type SiteType = (typeof SITE_TYPES)[number];

export const SITE_STATUSES = ['Active', 'Maintenance', 'Inactive'] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

export interface ISite extends BaseDocument {
  siteCode: string;
  city: string;
  type: SiteType;
  address: string;
  gps?: string;
  width?: number;
  height?: number;
  baseCostPerDay: number;
  vendorId: Types.ObjectId;
  status: SiteStatus;
  photos: string[];
}

const siteSchema = new Schema<ISite>(
  {
    siteCode: { type: String, required: true, unique: true, index: true },
    city: { type: String, required: true, index: true },
    type: { type: String, enum: SITE_TYPES, required: true },
    address: { type: String, required: true },
    gps: { type: String },
    width: { type: Number },
    height: { type: Number },
    baseCostPerDay: { type: Number, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    status: {
      type: String,
      enum: SITE_STATUSES,
      default: 'Active',
      index: true,
    },
    photos: [{ type: String }],
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

siteSchema.plugin(basePlugin);

export const Site = mongoose.model<ISite>('Site', siteSchema);

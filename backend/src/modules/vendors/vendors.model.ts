import mongoose, { Schema, Document } from 'mongoose';
import { basePlugin, type BaseDocument } from '../../core/db/basePlugin.js';

export const VENDOR_STATUSES = ['Active', 'Inactive', 'Blacklisted'] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export interface IVendor extends BaseDocument {
  name: string;
  city: string;
  siteOwnerName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  address: string;
  gstNumber?: string;
  paymentTerms?: string;
  bankAccount?: string;
  ifscCode?: string;
  status: VendorStatus;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    city: { type: String, required: true, index: true },
    siteOwnerName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    gstNumber: { type: String },
    paymentTerms: { type: String },
    bankAccount: { type: String },
    ifscCode: { type: String },
    status: {
      type: String,
      enum: VENDOR_STATUSES,
      default: 'Active',
      index: true,
    },
  },
  {
    // basePlugin handles timestamps
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

vendorSchema.plugin(basePlugin);

export const Vendor = mongoose.model<IVendor>('Vendor', vendorSchema);

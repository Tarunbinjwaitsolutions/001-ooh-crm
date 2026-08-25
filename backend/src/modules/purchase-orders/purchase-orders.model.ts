import mongoose, { Schema, Types } from 'mongoose';
import { basePlugin, type BaseDocument } from '../../core/db/basePlugin.js';

export const PO_STATUSES = ['Draft', 'Issued', 'Accepted', 'Cancelled'] as const;
export type POStatus = (typeof PO_STATUSES)[number];

export interface IPurchaseOrderSite {
  siteId: Types.ObjectId;
  negotiatedRate: number;
}

export interface IPurchaseOrder extends BaseDocument {
  poNumber: string;
  campaignId: Types.ObjectId;
  vendorId: Types.ObjectId;
  sites: IPurchaseOrderSite[];
  totalAmount: number;
  status: POStatus;
  startDate: Date;
  endDate: Date;
  issuedDate?: Date;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    sites: [
      {
        siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
        negotiatedRate: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: PO_STATUSES,
      default: 'Draft',
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    issuedDate: { type: Date },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

purchaseOrderSchema.plugin(basePlugin);

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);

import mongoose, { Schema, Types } from 'mongoose';
import { basePlugin, type BaseDocument } from '../../core/db/basePlugin.js';

export const QUOTATION_STATUSES = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export interface IQuotationLine {
  siteId: Types.ObjectId;
  description?: string;
  ratePerDay: number; // paise
  startDate: Date;
  endDate: Date;
  days: number;
  amount: number; // paise
}

export interface IQuotation extends BaseDocument {
  quoteNumber: string;
  leadId: Types.ObjectId;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  sites: IQuotationLine[];
  subtotal: number; // paise
  taxPercent: number;
  taxAmount: number; // paise
  total: number; // paise
  validUntil: Date;
  status: QuotationStatus;
  pdfKey?: string;
  sentAt?: Date | null;
  sentTo?: string | null;
  trackingToken?: string | null;
  viewedAt?: Date | null;
  acceptedAt?: Date | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
}

const quotationLineSchema = new Schema<IQuotationLine>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
    description: { type: String, trim: true },
    ratePerDay: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false },
);

const quotationSchema = new Schema<IQuotation>(
  {
    quoteNumber: { type: String, required: true, unique: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    clientName: { type: String, trim: true },
    clientEmail: { type: String, trim: true },
    clientPhone: { type: String, trim: true },
    sites: { type: [quotationLineSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0 },
    taxPercent: { type: Number, required: true, default: 18 },
    taxAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: QUOTATION_STATUSES, default: 'Draft', index: true },
    pdfKey: { type: String },
    sentAt: { type: Date, default: null },
    sentTo: { type: String, trim: true },
    trackingToken: { type: String, unique: true, sparse: true, index: true },
    viewedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true },
);

quotationSchema.plugin(basePlugin);

export const Quotation =
  (mongoose.models.Quotation as mongoose.Model<IQuotation>) ??
  mongoose.model<IQuotation>('Quotation', quotationSchema);

import mongoose, { Schema, Types } from 'mongoose';
import { basePlugin, BaseDocument } from '../../core/db/basePlugin.js';

export const LEAD_SOURCES = [
  'JustDial',
  'Website',
  'WhatsApp',
  'Facebook',
  'Instagram',
  'Email',
  'Referral',
  'Manual',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Interested',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LOCATION_PREFERENCES = ['Airport', 'Highway', 'Mall', 'Metro', 'Other'] as const;
export type LocationPreference = (typeof LOCATION_PREFERENCES)[number];

export interface ILeadQualification {
  city?: string;
  locationPreference?: LocationPreference;
  campaignDuration?: string;
  budget?: number;
  targetAudience?: string;
  campaignObjective?: string;
  creativeRequirements?: string;
  notes?: string;
  lostReason?: string;
}

export interface ILead extends BaseDocument {
  companyName: string;
  contactPerson: string;
  mobile: string;
  email?: string;
  city: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: Types.ObjectId | null;
  slaTimerEnd?: Date | null;
  qualification?: ILeadQualification;
}

const qualificationSchema = new Schema<ILeadQualification>(
  {
    city: { type: String, trim: true },
    locationPreference: { type: String, enum: LOCATION_PREFERENCES },
    campaignDuration: { type: String, trim: true },
    budget: { type: Number, min: 0 },
    targetAudience: { type: String, trim: true },
    campaignObjective: { type: String, trim: true },
    creativeRequirements: { type: String, trim: true },
    notes: { type: String, trim: true },
    lostReason: { type: String, trim: true },
  },
  { _id: false },
);

const leadSchema = new Schema<ILead>({
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  city: { type: String, required: true, trim: true },
  source: { type: String, enum: LEAD_SOURCES, required: true },
  status: { type: String, enum: LEAD_STATUSES, default: 'New' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  slaTimerEnd: { type: Date, default: null },
  qualification: { type: qualificationSchema, default: {} },
});

leadSchema.plugin(basePlugin);

export const Lead = mongoose.model<ILead>('Lead', leadSchema);

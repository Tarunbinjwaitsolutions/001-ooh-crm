import mongoose, { Schema } from 'mongoose';
import { basePlugin, type BaseDocument } from '../../core/db/basePlugin.js';

export const CAMPAIGN_STATUSES = ['Draft', 'Active', 'Completed', 'Cancelled'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export interface ICampaign extends BaseDocument {
  name: string;
  status: CampaignStatus;
}

const campaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: CAMPAIGN_STATUSES,
      default: 'Draft',
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

campaignSchema.plugin(basePlugin);

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

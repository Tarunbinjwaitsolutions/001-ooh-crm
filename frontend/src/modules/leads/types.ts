export type LeadSource =
  | 'JustDial'
  | 'Website'
  | 'WhatsApp'
  | 'Facebook'
  | 'Instagram'
  | 'Email'
  | 'Referral'
  | 'Manual';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LocationPreference = 'Airport' | 'Highway' | 'Mall' | 'Metro' | 'Other';

export interface LeadQualification {
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

export interface Lead {
  id: string; // The backend uses _id mapped to id if transformed, but often we just use _id or id based on JSON serialization. Let's use `id` or `_id`. We'll define `id`.
  _id: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email?: string;
  city: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  slaTimerEnd?: string | null;
  qualification?: LeadQualification;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsListResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus | '';
  city?: string;
  source?: LeadSource | '';
  assignedTo?: string;
  assignedToMe?: boolean;
  unassigned?: boolean;
  fromDate?: string;
  toDate?: string;
}

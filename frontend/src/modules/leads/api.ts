import { api } from '../../shared/api/client';
import { Lead, LeadFilters, LeadsListResponse, LeadQualification } from './types';

export const leadsApi = {
  getLeads: (filters?: LeadFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return api.get<LeadsListResponse>(`/api/leads?${params.toString()}`);
  },

  getLead: (id: string) => api.get<Lead>(`/api/leads/${id}`),

  createLead: (data: Partial<Lead>) => api.post<Lead>('/api/leads', data),

  updateLead: (id: string, data: Partial<Lead>) => api.patch<Lead>(`/api/leads/${id}`, data),

  claimLead: (id: string) => api.post<Lead>(`/api/leads/${id}/claim`),

  qualifyLead: (id: string, data: LeadQualification) =>
    api.patch<Lead>(`/api/leads/${id}/qualify`, data),
};

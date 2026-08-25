import { api as client } from '../../shared/api/client';
import type { Site, SitesResponse, Booking } from './types';

export const sitesApi = {
  getSites: async (params?: Record<string, string>): Promise<SitesResponse> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return client.get<SitesResponse>('/sites' + qs);
  },

  getSite: async (id: string): Promise<Site> => {
    return client.get<Site>(`/sites/${id}`);
  },

  createSite: async (data: Partial<Site>): Promise<Site> => {
    return client.post<Site>('/sites', data);
  },

  updateSite: async (id: string, data: Partial<Site>): Promise<Site> => {
    return client.patch<Site>(`/sites/${id}`, data);
  },

  bulkImport: async (sites: Partial<Site>[]): Promise<{ imported: number, errors: string[] }> => {
    return client.post<{ imported: number, errors: string[] }>('/sites/import', { sites });
  },

  getAvailability: async (fromDate: string, toDate: string, city?: string): Promise<Site[]> => {
    const params = new URLSearchParams({ fromDate, toDate });
    if (city) params.append('city', city);
    return client.get<Site[]>(`/sites/availability?${params.toString()}`);
  },

  getSiteCalendar: async (id: string, fromDate: string, toDate: string): Promise<Booking[]> => {
    const params = new URLSearchParams({ fromDate, toDate });
    return client.get<Booking[]>(`/sites/${id}/calendar?${params.toString()}`);
  }
};

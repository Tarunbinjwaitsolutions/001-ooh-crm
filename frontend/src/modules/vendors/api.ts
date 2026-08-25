import { api as client } from '../../shared/api/client';
import type { Vendor, VendorsResponse } from './types';

export const vendorsApi = {
  getVendors: async (params?: Record<string, string>): Promise<VendorsResponse> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return client.get<VendorsResponse>('/vendors' + qs);
  },

  getVendor: async (id: string): Promise<Vendor> => {
    return client.get<Vendor>(`/vendors/${id}`);
  },

  createVendor: async (data: Partial<Vendor>): Promise<Vendor> => {
    return client.post<Vendor>('/vendors', data);
  },

  updateVendor: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
    return client.patch<Vendor>(`/vendors/${id}`, data);
  }
};

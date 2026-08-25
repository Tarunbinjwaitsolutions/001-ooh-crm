'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLeads } from '@/modules/leads/hooks/use-leads';
import { leadsApi } from '@/modules/leads/api';
import { LeadStatus, LeadSource, Lead } from '@/modules/leads/types';
import { Card, Button, Badge, Spinner, Field, SelectField, Alert } from '@/shared/ui';

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<'my-leads' | 'unclaimed' | 'all'>('my-leads');
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [city, setCity] = useState('');
  const [source, setSource] = useState<LeadSource | ''>('');
  const [page, setPage] = useState(1);

  const filters = {
    search,
    status,
    city,
    source,
    page,
    limit: 25,
    ...(activeTab === 'unclaimed' ? { unassigned: true } : {}),
    ...(activeTab === 'my-leads' ? { assignedToMe: true } : {}),
  };

  // Poll every 15s if we are on the unclaimed tab
  const pollInterval = activeTab === 'unclaimed' ? 15000 : undefined;
  
  const { data, isLoading, error, mutate } = useLeads(filters, pollInterval);

  const handleClaim = async (leadId: string) => {
    try {
      await leadsApi.claimLead(leadId);
      mutate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Another agent has already claimed this lead.';
      alert(`Conflict: ${msg}`);
      mutate(); // refresh to show it's gone
    }
  };

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Leads</h1>
        <Link href="/leads/new">
          <Button>Add Lead</Button>
        </Link>
      </div>

      <div className="flex gap-4 border-b border-[#E6E8EC]">
        <button
          onClick={() => { setActiveTab('my-leads'); setPage(1); }}
          className={`h-11 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'my-leads'
              ? 'border-[#6E1D1D] text-[#6E1D1D]'
              : 'border-transparent text-[#687280] hover:text-[#1F2937]'
          }`}
        >
          My Leads
        </button>
        <button
          onClick={() => { setActiveTab('unclaimed'); setPage(1); }}
          className={`h-11 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'unclaimed'
              ? 'border-[#6E1D1D] text-[#6E1D1D]'
              : 'border-transparent text-[#687280] hover:text-[#1F2937]'
          }`}
        >
          Unclaimed
          <Badge>Live</Badge>
        </button>
        <button
          onClick={() => { setActiveTab('all'); setPage(1); }}
          className={`h-11 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-[#6E1D1D] text-[#6E1D1D]'
              : 'border-transparent text-[#687280] hover:text-[#1F2937]'
          }`}
        >
          All Leads
        </button>
      </div>

      <Card className="flex items-end gap-4 p-4">
        <Field
          label="Search"
          placeholder="Company or Mobile"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <SelectField
          label="Status"
          options={[
            { label: 'New', value: 'New' },
            { label: 'Contacted', value: 'Contacted' },
            { label: 'Interested', value: 'Interested' },
            { label: 'Qualified', value: 'Qualified' },
            { label: 'Proposal Sent', value: 'Proposal Sent' },
            { label: 'Negotiation', value: 'Negotiation' },
            { label: 'Won', value: 'Won' },
            { label: 'Lost', value: 'Lost' },
          ]}
          value={status}
          onChange={(e) => { setStatus(e.target.value as LeadStatus); setPage(1); }}
          placeholder="All Statuses"
        />
        <SelectField
          label="Source"
          options={[
            { label: 'JustDial', value: 'JustDial' },
            { label: 'Website', value: 'Website' },
            { label: 'WhatsApp', value: 'WhatsApp' },
            { label: 'Facebook', value: 'Facebook' },
            { label: 'Instagram', value: 'Instagram' },
            { label: 'Email', value: 'Email' },
            { label: 'Referral', value: 'Referral' },
            { label: 'Manual', value: 'Manual' },
          ]}
          value={source}
          onChange={(e) => { setSource(e.target.value as LeadSource); setPage(1); }}
          placeholder="All Sources"
        />
        <Field
          label="City"
          placeholder="Any City"
          value={city}
          onChange={(e) => { setCity(e.target.value); setPage(1); }}
        />
      </Card>

      {error ? (
        <Alert tone="error" title="Error Loading Leads">
          {error.message}
        </Alert>
      ) : isLoading && !data ? (
        <div className="py-12 flex justify-center"><Spinner label="Loading leads..." /></div>
      ) : data?.data.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No leads found.</div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data?.data.map((lead: Lead) => (
                  <tr key={lead._id || lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        <Link href={`/leads/${lead._id || lead.id}`} className="hover:underline">
                          {lead.companyName}
                        </Link>
                      </div>
                      <div className="text-xs">{lead.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{lead.contactPerson}</div>
                      <div className="text-xs">{lead.mobile}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{lead.status}</Badge>
                      {lead.slaTimerEnd && new Date(lead.slaTimerEnd) < new Date() && (
                        <span className="ml-2 text-xs text-red-500 font-semibold">SLA Breach</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{lead.source}</td>
                    <td className="px-4 py-3">{lead.assignedTo?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      {activeTab === 'unclaimed' ? (
                        <Button variant="secondary" onClick={() => handleClaim(lead._id || lead.id)}>
                          Claim
                        </Button>
                      ) : (
                        <Link href={`/leads/${lead._id || lead.id}`}>
                          <Button variant="ghost">View</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {data && data.meta.total > data.meta.limit && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="text-sm text-slate-500">
                Showing {((page - 1) * data.meta.limit) + 1} to {Math.min(page * data.meta.limit, data.meta.total)} of {data.meta.total} results
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={page * data.meta.limit >= data.meta.total} 
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

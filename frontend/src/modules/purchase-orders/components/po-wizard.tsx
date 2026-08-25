'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, FieldWrapper, Card, Spinner, Alert } from '../../../shared/ui';
import { vendorsApi } from '../../vendors/api';
import { sitesApi } from '../../sites/api';
// We don't have a fully implemented campaign module, but we created a route to list campaigns
import { api as client } from '../../../shared/api/client';
import { purchaseOrdersApi } from '../api';

export function POWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data sources
  const [vendors, setVendors] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [vendorSites, setVendorSites] = useState<any[]>([]);

  // Wizard state
  const [vendorId, setVendorId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSites, setSelectedSites] = useState<{siteId: string, negotiatedRate: number}[]>([]);

  useEffect(() => {
    // Load vendors and campaigns initially
    Promise.all([
      vendorsApi.getVendors({ limit: '1000' }),
      client.get<any[]>('/campaigns')
    ]).then(([vendorsRes, campaignsRes]) => {
      setVendors(vendorsRes.data);
      setCampaigns(campaignsRes);
    }).catch(err => {
      console.error(err);
      setError('Failed to load initial data');
    });
  }, []);

  const handleNextStep1 = async () => {
    if (!vendorId) return setError('Please select a vendor');
    if (!campaignId) return setError('Please select a campaign');
    setError(null);
    
    // Load sites for the vendor
    try {
      const res = await sitesApi.getSites({ vendorId, limit: '1000' });
      setVendorSites(res.data);
      setStep(2);
    } catch (err: any) {
      setError('Failed to load sites for vendor');
    }
  };

  const handleNextStep2 = () => {
    if (!startDate || !endDate) return setError('Please select start and end dates');
    if (new Date(startDate) > new Date(endDate)) return setError('Start date must be before end date');
    if (selectedSites.length === 0) return setError('Please select at least one site');
    
    for (const site of selectedSites) {
      if (site.negotiatedRate < 0) return setError('Negotiated rates cannot be negative');
    }

    setError(null);
    setStep(3);
  };

  const handleAddSite = (siteId: string, rate: number) => {
    setSelectedSites(prev => {
      if (prev.find(s => s.siteId === siteId)) return prev;
      return [...prev, { siteId, negotiatedRate: rate }];
    });
  };

  const handleRemoveSite = (siteId: string) => {
    setSelectedSites(prev => prev.filter(s => s.siteId !== siteId));
  };

  const handleRateChange = (siteId: string, rate: number) => {
    setSelectedSites(prev => prev.map(s => s.siteId === siteId ? { ...s, negotiatedRate: rate } : s));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        vendorId,
        campaignId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        sites: selectedSites
      };
      const po = await purchaseOrdersApi.createPurchaseOrder(payload);
      router.push(`/purchase-orders/${po._id || po.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create PO');
      setIsSubmitting(false);
    }
  };

  const totalAmount = selectedSites.reduce((sum, site) => sum + Number(site.negotiatedRate), 0);
  const vendorName = vendors.find(v => (v._id || v.id) === vendorId)?.name;
  const campaignName = campaigns.find(c => (c._id || c.id) === campaignId)?.name;

  return (
    <Card className="p-6">
      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}
      
      {/* Step Indicators */}
      <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className={`font-medium ${step === 1 ? 'text-primary' : 'text-slate-500'}`}>1. Vendor & Campaign</div>
        <div className={`font-medium ${step === 2 ? 'text-primary' : 'text-slate-500'}`}>2. Dates & Sites</div>
        <div className={`font-medium ${step === 3 ? 'text-primary' : 'text-slate-500'}`}>3. Review</div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <FieldWrapper label="Vendor" required>
            <select
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="" disabled>Select a vendor...</option>
              {vendors.map(v => (
                <option key={v._id || v.id} value={v._id || v.id}>{v.name} ({v.city})</option>
              ))}
            </select>
          </FieldWrapper>
          
          <FieldWrapper label="Campaign" required>
            <div className="flex gap-2">
              <select
                value={campaignId}
                onChange={e => setCampaignId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="" disabled>Select a campaign...</option>
                {campaigns.map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-1">If list is empty, create a campaign first using the backend API.</p>
          </FieldWrapper>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="primary" onClick={handleNextStep1}>Next Step</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FieldWrapper label="Start Date" required>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900"
              />
            </FieldWrapper>
            <FieldWrapper label="End Date" required>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900"
              />
            </FieldWrapper>
          </div>

          <div>
            <h4 className="font-medium mb-2">Available Vendor Sites</h4>
            {vendorSites.length === 0 ? (
              <p className="text-sm text-slate-500">No sites found for this vendor.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-md dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="p-2">Site Code</th>
                      <th className="p-2">City</th>
                      <th className="p-2">Base Cost</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorSites.map(site => {
                      const id = site._id || site.id;
                      const isSelected = selectedSites.some(s => s.siteId === id);
                      return (
                        <tr key={id} className="border-t border-slate-200 dark:border-slate-800">
                          <td className="p-2">{site.siteCode}</td>
                          <td className="p-2">{site.city}</td>
                          <td className="p-2">₹{site.baseCostPerDay}</td>
                          <td className="p-2">
                            {isSelected ? (
                              <button type="button" onClick={() => handleRemoveSite(id)} className="text-red-500 hover:underline">Remove</button>
                            ) : (
                              <button type="button" onClick={() => handleAddSite(id, site.baseCostPerDay)} className="text-primary hover:underline">Add</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Selected Sites & Rates</h4>
            {selectedSites.length === 0 ? (
              <p className="text-sm text-slate-500">No sites selected.</p>
            ) : (
              <div className="space-y-3">
                {selectedSites.map(selection => {
                  const site = vendorSites.find(s => (s._id || s.id) === selection.siteId);
                  return (
                    <div key={selection.siteId} className="flex items-center gap-4 p-3 bg-slate-50 rounded-md dark:bg-slate-800/50">
                      <div className="flex-1">
                        <div className="font-medium">{site?.siteCode} - {site?.city}</div>
                        <div className="text-xs text-slate-500">Base Cost: ₹{site?.baseCostPerDay}</div>
                      </div>
                      <div className="w-48">
                        <label className="text-xs text-slate-500 block mb-1">Negotiated Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={selection.negotiatedRate}
                          onChange={e => handleRateChange(selection.siteId, Number(e.target.value))}
                          className="w-full rounded-md border border-slate-300 px-3 py-1 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" onClick={handleNextStep2}>Next Step</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-md dark:bg-slate-800/50">
            <h3 className="text-lg font-medium mb-4">Review Purchase Order</h3>
            
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm mb-6">
              <div>
                <dt className="text-slate-500">Vendor</dt>
                <dd className="font-medium">{vendorName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Campaign</dt>
                <dd className="font-medium">{campaignName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-medium">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</dd>
              </div>
            </dl>

            <h4 className="font-medium mb-2">Sites Included ({selectedSites.length})</h4>
            <ul className="space-y-2 mb-6">
              {selectedSites.map(selection => {
                const site = vendorSites.find(s => (s._id || s.id) === selection.siteId);
                return (
                  <li key={selection.siteId} className="flex justify-between text-sm border-b border-slate-200 pb-2 dark:border-slate-700">
                    <span>{site?.siteCode} ({site?.city})</span>
                    <span className="font-medium">₹{selection.negotiatedRate}</span>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-between items-center text-lg font-semibold pt-4 border-t border-slate-300 dark:border-slate-700">
              <span>Total Amount</span>
              <span className="text-primary">₹{totalAmount}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>Confirm & Create PO</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

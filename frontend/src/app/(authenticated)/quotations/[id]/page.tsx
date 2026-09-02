'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { quotationsApi } from '@/modules/quotations/api';
import { sessionStore } from '@/shared/auth/session-store';
import type { Quotation } from '@/modules/quotations/types';

export default function QuotationDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Send modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  // PDF state
  const [pdfLoading, setPdfLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function withAuthToken(rawUrl: string): string {
    if (!rawUrl) return '';
    const token = sessionStore.getAccessToken();
    if (token && rawUrl.startsWith('/api/files/')) {
      const separator = rawUrl.includes('?') ? '&' : '?';
      return `${rawUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    return rawUrl;
  }

  useEffect(() => {
    if (id) fetchQuotation();
  }, [id]);

  async function fetchQuotation() {
    try {
      setLoading(true);
      setError(null);
      const q = await quotationsApi.getById(id);
      setQuotation(q);
      setRecipientEmail(q.clientEmail || '');

      if (q.pdfKey) {
        loadPdfUrl();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  }

  async function loadPdfUrl() {
    try {
      const res = await quotationsApi.getPdfUrl(id);
      setPdfUrl(withAuthToken(res.pdfUrl));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGeneratePdf() {
    try {
      setPdfLoading(true);
      const res = await quotationsApi.generatePdf(id);
      setPdfUrl(withAuthToken(res.pdfUrl));
      if (quotation) {
        setQuotation({ ...quotation, pdfKey: res.pdfKey });
      }
    } catch (err: any) {
      alert(err.message || 'PDF generation failed');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }

    try {
      setUploadLoading(true);
      const res = await quotationsApi.uploadPdf(id, file);
      setPdfUrl(withAuthToken(res.pdfUrl));
      if (quotation) {
        setQuotation({ ...quotation, pdfKey: res.pdfKey });
      }
      alert('Custom proposal PDF uploaded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload PDF');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientEmail.trim()) return;

    try {
      setSendLoading(true);
      const res = await quotationsApi.send(id, recipientEmail.trim());
      setQuotation(res.quotation);
      setPublicUrl(window.location.origin + res.publicUrl);
    } catch (err: any) {
      alert(err.message || 'Failed to send proposal');
    } finally {
      setSendLoading(false);
    }
  }

  function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading quotation details...</div>;
  }

  if (error || !quotation) {
    return (
      <div className="p-8 text-center text-rose-600">
        {error || 'Quotation not found'}
      </div>
    );
  }

  const leadInfo = typeof quotation.leadId === 'object' ? quotation.leadId : null;
  const clientDisplayName = quotation.clientName || leadInfo?.companyName || 'Valued Client';

  return (
    <div className="space-y-6">
      {/* Hidden PDF file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {quotation.quoteNumber}
            </h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {quotation.status}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Created for <span className="font-medium text-slate-900 dark:text-white">{clientDisplayName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/quotations"
            className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Back
          </Link>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={pdfLoading || uploadLoading}
            className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pdfLoading ? 'Generating PDF...' : quotation.pdfKey ? 'Regenerate PDF' : 'Generate PDF'}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading || pdfLoading}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {uploadLoading ? 'Uploading...' : '📤 Upload Custom PDF'}
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
            >
              📄 View PDF
            </a>
          )}

          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Send Proposal
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column (2 spans) */}
        <div className="space-y-6 md:col-span-2">
          {/* Sites & Line Items Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Selected Media Sites</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="p-2">Site / Code</th>
                    <th className="p-2">Dates</th>
                    <th className="p-2 text-right">Days</th>
                    <th className="p-2 text-right">Rate/Day</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {quotation.sites.map((line, idx) => {
                    const siteObj = typeof line.siteId === 'object' ? line.siteId : null;
                    const code = siteObj?.siteCode || 'Outdoor Site';
                    const city = siteObj?.city || '';

                    return (
                      <tr key={idx}>
                        <td className="p-2 font-medium text-slate-900 dark:text-white">
                          {code} {city && <span className="text-slate-400">({city})</span>}
                        </td>
                        <td className="p-2 text-slate-500">
                          {new Date(line.startDate).toLocaleDateString('en-IN')} -{' '}
                          {new Date(line.endDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-2 text-right">{line.days}</td>
                        <td className="p-2 text-right">{formatRupees(line.ratePerDay)}</td>
                        <td className="p-2 text-right font-semibold text-slate-900 dark:text-white">
                          {formatRupees(line.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PDF Viewer Block */}
          {pdfUrl && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Proposal PDF Preview</h2>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Open PDF in New Tab
                </a>
              </div>
              <iframe src={pdfUrl} className="h-96 w-full rounded border border-slate-200 dark:border-slate-800" />
            </div>
          )}
        </div>

        {/* Right Column: Financial Summary & Timeline */}
        <div className="space-y-6">
          {/* Financial Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Financial Breakdown</h2>
            <dl className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium">{formatRupees(quotation.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>GST (18%)</dt>
                <dd className="font-medium text-slate-500">{formatRupees(quotation.taxAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                <dt>Total Amount</dt>
                <dd className="text-emerald-600 dark:text-emerald-400">{formatRupees(quotation.total)}</dd>
              </div>
            </dl>
          </div>

          {/* Proposal Tracking Timeline (B3) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Tracking Timeline</h2>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Created:</span>{' '}
                {quotation.createdAt ? new Date(quotation.createdAt).toLocaleString('en-IN') : '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Sent At:</span>{' '}
                {quotation.sentAt ? new Date(quotation.sentAt).toLocaleString('en-IN') : 'Not sent yet'}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">First Viewed:</span>{' '}
                {quotation.viewedAt ? new Date(quotation.viewedAt).toLocaleString('en-IN') : 'Not viewed'}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Status Decision:</span>{' '}
                {quotation.acceptedAt
                  ? `Accepted on ${new Date(quotation.acceptedAt).toLocaleString('en-IN')}`
                  : quotation.rejectedAt
                    ? `Rejected on ${new Date(quotation.rejectedAt).toLocaleString('en-IN')}`
                    : 'Awaiting decision'}
              </div>
              {quotation.rejectionReason && (
                <div className="rounded bg-rose-50 p-2 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  <span className="font-semibold">Reason:</span> {quotation.rejectionReason}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send Proposal Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Send Proposal to Client</h2>
            <p className="mb-4 text-xs text-slate-500">
              Generates a cryptographically random 32-character tracking token for public viewing.
            </p>

            <form onSubmit={handleSendSubmit} className="space-y-4">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Recipient Email *
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </label>

              {publicUrl && (
                <div className="rounded bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <p className="font-semibold">Proposal Sent!</p>
                  <p className="mt-1 font-mono text-[11px] break-all">{publicUrl}</p>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-semibold underline"
                  >
                    Test Client View $\rightarrow$
                  </a>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sendLoading}
                  className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {sendLoading ? 'Sending...' : 'Confirm & Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

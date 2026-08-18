import assert from 'node:assert/strict';
import test from 'node:test';

import { formatPaise, lineItemsTable, renderPdf } from './index.js';

test('formatPaise renders integer paise as rupees with Indian grouping', () => {
  assert.equal(formatPaise(125050), 'INR 1,250.50');
  assert.equal(formatPaise(125000000), 'INR 12,50,000.00');
  assert.equal(formatPaise(0), 'INR 0.00');
});

test('renderPdf produces a real PDF buffer', async () => {
  const buffer = await renderPdf({
    title: 'Quotation',
    reference: 'MO-Q-2026-0001',
    meta: [['Client', 'Acme Advertising']],
    build: (doc) => {
      doc.text('Body content');
    },
  });

  assert.ok(Buffer.isBuffer(buffer));
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-', 'must start with the PDF magic bytes');
  assert.ok(buffer.byteLength > 800, 'a rendered page should not be near-empty');
});

test('renderPdf handles a line-items table with totals', async () => {
  const buffer = await renderPdf({
    title: 'Purchase Order',
    build: (doc) => {
      lineItemsTable(doc, {
        columns: [
          { header: 'Site', width: 0.5 },
          { header: 'Days', width: 0.2, align: 'right' },
          { header: 'Amount', width: 0.3, align: 'right' },
        ],
        rows: [
          ['Airport Hoarding — T2 Approach', '30', formatPaise(4500000)],
          ['Highway Unipole — NH48 km 12', '30', formatPaise(2700000)],
        ],
        totals: [
          ['Subtotal', 7200000],
          ['GST 18%', 1296000],
          ['Total', 8496000],
        ],
      });
    },
  });

  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
});

test('an error thrown inside build rejects rather than hanging', async () => {
  await assert.rejects(
    renderPdf({
      title: 'Broken',
      build: () => {
        throw new Error('boom');
      },
    }),
    /boom/,
  );
});

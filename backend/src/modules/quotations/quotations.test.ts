import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';

import { QuotationsService } from './quotations.service.js';
import { Quotation } from './quotations.model.js';
import { Lead } from '../leads/leads.model.js';

const FAKE_CTX = { user: { id: '64b7f9a1c2d3e4f5a6b7c8d9' } } as any;

test('days inclusive and paise and tax calculation', async () => {
  const origLeadFindOne = (Lead as any).findOne;
  const origCreate = (Quotation as any).create;
  const CounterModel = mongoose.models.Counter as any;
  const origFindByIdAndUpdate = CounterModel?.findByIdAndUpdate;

  try {
    if (CounterModel) {
      CounterModel.findByIdAndUpdate = async () => ({ seq: 1 });
    }
    (Lead as any).findOne = async () => ({ _id: '64b7f9a1c2d3e4f5a6b7c8d0', companyName: 'ACME Corp' });
    (Quotation as any).create = async (payload: any) => ({
      ...payload,
      _id: '64b7f9a1c2d3e4f5a6b7c8d1',
      populate: async () => {},
    });

    const data = {
      leadId: '64b7f9a1c2d3e4f5a6b7c8d0',
      clientName: 'ACME',
      sites: [
        { siteId: '64b7f9a1c2d3e4f5a6b7c8d1', ratePerDay: 1000, startDate: '2026-08-01', endDate: '2026-08-03' },
      ],
    };

    const created = await QuotationsService.create(data as any, FAKE_CTX);
    // days = 3, rate=1000 rupees => 100000 paise per day -> amount = 3*100000 = 300000
    assert.equal(created.sites[0].days, 3);
    assert.equal(created.sites[0].ratePerDay, 100000);
    assert.equal(created.sites[0].amount, 300000);
    assert.equal(created.subtotal, 300000);
    // tax 18% of 300000 = 54000
    assert.equal(created.taxAmount, 54000);
    assert.equal(created.total, 354000);
    assert.equal(created.status, 'Draft');
    assert.equal(created.taxPercent, 18);
  } finally {
    (Lead as any).findOne = origLeadFindOne;
    (Quotation as any).create = origCreate;
    if (CounterModel && origFindByIdAndUpdate) {
      CounterModel.findByIdAndUpdate = origFindByIdAndUpdate;
    }
  }
});

test('only Draft can be edited', async () => {
  const origFindOne = (Quotation as any).findOne;
  try {
    (Quotation as any).findOne = () => ({
      _id: '64b7f9a1c2d3e4f5a6b7c8d9',
      status: 'Sent',
      sites: [],
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      save: async () => ({}),
    });

    let thrown = false;
    try {
      await QuotationsService.update('64b7f9a1c2d3e4f5a6b7c8d9', { clientName: 'X' }, FAKE_CTX);
    } catch (err: any) {
      thrown = true;
      assert.ok(/Only Draft/.test(err.message));
    }
    assert.ok(thrown, 'Expected validation error when editing non-Draft');
  } finally {
    (Quotation as any).findOne = origFindOne;
  }
});

test('send generates 32-character trackingToken and sets status to Sent', async () => {
  const origFindOne = (Quotation as any).findOne;
  try {
    const mockDoc: any = {
      _id: '64b7f9a1c2d3e4f5a6b7c8d9',
      status: 'Draft',
      save: async function () { return this; },
    };
    (Quotation as any).findOne = () => mockDoc;

    const result = await QuotationsService.send('64b7f9a1c2d3e4f5a6b7c8d9', 'client@test.com', 'Please review', FAKE_CTX);

    assert.equal(result.quotation.status, 'Sent');
    assert.equal(typeof result.trackingToken, 'string');
    assert.equal(result.trackingToken.length, 32);
    assert.equal(result.publicUrl, `/q/${result.trackingToken}`);
  } finally {
    (Quotation as any).findOne = origFindOne;
  }
});

test('acceptPublic rejects expired proposal', async () => {
  const origFindOne = (Quotation as any).findOne;
  try {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
    const mockDoc: any = {
      _id: '64b7f9a1c2d3e4f5a6b7c8d9',
      status: 'Sent',
      validUntil: pastDate,
      save: async function () { return this; },
    };
    (Quotation as any).findOne = () => mockDoc;

    let thrown = false;
    try {
      await QuotationsService.acceptPublic('expired-token');
    } catch (err: any) {
      thrown = true;
      assert.ok(/expired/.test(err.message));
    }
    assert.ok(thrown, 'Expected expired validation error');
  } finally {
    (Quotation as any).findOne = origFindOne;
  }
});

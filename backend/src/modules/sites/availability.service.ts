import { PurchaseOrder } from '../purchase-orders/purchase-orders.model.js';
import { Site } from './sites.model.js';
import { RequestContext } from '../../core/context.js';
import { toObjectId } from '../../core/db/basePlugin.js';
import { Types } from 'mongoose';

export class AvailabilityService {
  /**
   * Search for sites that are available (not fully booked) between fromDate and toDate.
   * A site is considered booked if there's an Issued or Accepted PO overlapping the dates.
   */
  static async searchAvailableSites(filters: { fromDate: Date, toDate: Date, city?: string }, ctx: RequestContext) {
    const siteQuery: Record<string, any> = { deletedAt: null, status: 'Active' };
    if (filters.city) {
      siteQuery.city = filters.city;
    }

    // Find all overlapping POs
    const overlappingPOs = await PurchaseOrder.find({
      deletedAt: null,
      status: { $in: ['Issued', 'Accepted'] },
      startDate: { $lte: filters.toDate },
      endDate: { $gte: filters.fromDate }
    }).select('sites.siteId').lean();

    const bookedSiteIds = new Set<string>();
    for (const po of overlappingPOs) {
      for (const site of po.sites) {
        bookedSiteIds.add(site.siteId.toString());
      }
    }

    // Now find sites that are NOT in bookedSiteIds
    const sites = await Site.find(siteQuery).populate('vendorId', 'name').lean();

    return sites.filter(s => !bookedSiteIds.has(s._id.toString()));
  }

  /**
   * Get booking calendar for a specific site in a date range.
   * Returns a list of booked intervals.
   */
  static async getSiteCalendar(siteId: string, fromDate: Date, toDate: Date, ctx: RequestContext) {
    const overlappingPOs = await PurchaseOrder.find({
      deletedAt: null,
      status: { $in: ['Issued', 'Accepted'] },
      'sites.siteId': toObjectId(siteId),
      startDate: { $lte: toDate },
      endDate: { $gte: fromDate }
    }).populate('campaignId', 'name').lean();

    return overlappingPOs.map(po => {
      const camp: any = po.campaignId;
      return {
        poNumber: po.poNumber,
        campaignName: camp?.name || 'Unknown Campaign',
        startDate: po.startDate,
        endDate: po.endDate,
        status: po.status
      };
    });
  }
}

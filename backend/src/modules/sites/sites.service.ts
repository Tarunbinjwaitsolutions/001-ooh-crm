import { Types } from 'mongoose';
import { RequestContext } from '../../core/context.js';
import { NotFoundError, ValidationError } from '../../core/errors/index.js';
import { scopedFind, scopedFindOne, scopedCount } from '../../core/scoping/index.js';
import { Site, type ISite } from './sites.model.js';
import { toObjectId } from '../../core/db/basePlugin.js';

export class SitesService {
  static async listSites(
    filters: any,
    ctx: RequestContext,
  ): Promise<{ sites: ISite[]; total: number }> {
    const query: Record<string, any> = {};

    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      query.$or = [{ siteCode: searchRegex }, { address: searchRegex }];
    }

    if (filters.status) query.status = filters.status;
    if (filters.city) query.city = filters.city;
    if (filters.type) query.type = filters.type;
    query.deletedAt = null;

    const skip = (filters.page - 1) * filters.limit;

    // Use scopedFind if we wanted to scope, but sites are globally visible 
    // unless there is a specific ownerField for ops managers. 
    // Usually sites are globally visible for 'sites.view' permission.
    const [sites, total] = await Promise.all([
      Site.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .populate('vendorId', 'name city')
        .exec(),
      Site.countDocuments(query).exec(),
    ]);

    return { sites, total };
  }

  static async getSite(id: string, ctx: RequestContext): Promise<ISite> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError('Site not found');

    const site = await Site.findOne({ _id: toObjectId(id), deletedAt: null }).populate('vendorId', 'name email city contactPerson').exec();
    
    if (!site) throw new NotFoundError('Site not found');
    return site;
  }

  static async createSite(data: any, ctx: RequestContext): Promise<ISite> {
    // Check if siteCode already exists
    const existing = await Site.findOne({ siteCode: data.siteCode, deletedAt: null });
    if (existing) {
      throw new ValidationError(`Site Code ${data.siteCode} already exists.`);
    }

    const site = await Site.create({
      ...data,
      vendorId: toObjectId(data.vendorId),
      createdBy: toObjectId(ctx.user.id),
    });
    return site;
  }

  static async updateSite(id: string, data: any, ctx: RequestContext): Promise<ISite> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError('Site not found');

    if (data.siteCode) {
      const existing = await Site.findOne({ siteCode: data.siteCode, _id: { $ne: toObjectId(id) }, deletedAt: null });
      if (existing) {
        throw new ValidationError(`Site Code ${data.siteCode} already exists.`);
      }
    }

    const updateData = { ...data, updatedBy: toObjectId(ctx.user.id) };
    if (data.vendorId) updateData.vendorId = toObjectId(data.vendorId);

    const site = await Site.findOneAndUpdate(
      { _id: toObjectId(id), deletedAt: null },
      { $set: updateData },
      { new: true },
    ).populate('vendorId', 'name city');

    if (!site) throw new NotFoundError('Site not found');
    return site;
  }

  static async bulkImportSites(data: any[], ctx: RequestContext): Promise<{ imported: number, errors: string[] }> {
    const errors: string[] = [];
    const validSites = [];

    // Pre-flight check codes
    const codes = data.map(d => d.siteCode);
    const existing = await Site.find({ siteCode: { $in: codes }, deletedAt: null }).select('siteCode').lean();
    const existingCodes = new Set(existing.map(e => e.siteCode));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (existingCodes.has(row.siteCode)) {
        errors.push(`Row ${i + 1}: Site Code ${row.siteCode} already exists.`);
        continue;
      }
      validSites.push({
        ...row,
        vendorId: toObjectId(row.vendorId),
        createdBy: toObjectId(ctx.user.id),
      });
    }

    if (validSites.length > 0) {
      await Site.insertMany(validSites);
    }

    return { imported: validSites.length, errors };
  }
}

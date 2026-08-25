import { Types } from 'mongoose';
import { RequestContext } from '../../core/context.js';
import { NotFoundError } from '../../core/errors/index.js';
import { scopedFind, scopedFindOne, scopedCount } from '../../core/scoping/index.js';
import { Vendor, type IVendor } from './vendors.model.js';
import { toObjectId } from '../../core/db/basePlugin.js';
import { roleHasPermission } from '../../core/rbac/permissions.js';

export class VendorsService {
  /**
   * List vendors.
   * Strips bank details if user lacks permission.
   */
  static async listVendors(
    filters: any,
    ctx: RequestContext,
  ): Promise<{ vendors: Partial<IVendor>[]; total: number }> {
    const query: Record<string, any> = {};

    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      query.$or = [{ name: searchRegex }, { contactPerson: searchRegex }];
    }

    if (filters.status) query.status = filters.status;
    if (filters.city) query.city = filters.city;
    query.deletedAt = null;

    const skip = (filters.page - 1) * filters.limit;

    // We don't apply scopedFind for Vendors because all agents can see all vendors.
    // We just strip deleted ones.
    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(filters.limit)
        .lean()
        .exec(),
      Vendor.countDocuments(query).exec(),
    ]);

    const canViewBank = roleHasPermission(ctx.user.role, 'finance.bank_details');

    const mapped = vendors.map(v => {
      if (!canViewBank) {
        delete v.bankAccount;
        delete v.ifscCode;
      }
      return v;
    });

    return { vendors: mapped, total };
  }

  static async getVendor(id: string, ctx: RequestContext): Promise<Partial<IVendor>> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError('Vendor not found');

    const vendor = await Vendor.findOne({ _id: toObjectId(id), deletedAt: null }).lean().exec();
    
    if (!vendor) throw new NotFoundError('Vendor not found');

    const canViewBank = roleHasPermission(ctx.user.role, 'finance.bank_details');
    if (!canViewBank) {
      delete vendor.bankAccount;
      delete vendor.ifscCode;
    }

    return vendor;
  }

  static async createVendor(data: any, ctx: RequestContext): Promise<IVendor> {
    const canManageBank = roleHasPermission(ctx.user.role, 'finance.bank_details');
    if (!canManageBank) {
      delete data.bankAccount;
      delete data.ifscCode;
    }

    const vendor = await Vendor.create({
      ...data,
      createdBy: toObjectId(ctx.user.id),
    });
    return vendor;
  }

  static async updateVendor(id: string, data: any, ctx: RequestContext): Promise<IVendor> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError('Vendor not found');

    const canManageBank = roleHasPermission(ctx.user.role, 'finance.bank_details');
    if (!canManageBank) {
      delete data.bankAccount;
      delete data.ifscCode;
    }

    const vendor = await Vendor.findOneAndUpdate(
      { _id: toObjectId(id), deletedAt: null },
      {
        $set: {
          ...data,
          updatedBy: toObjectId(ctx.user.id),
        },
      },
      { new: true },
    );

    if (!vendor) throw new NotFoundError('Vendor not found');
    return vendor;
  }
}

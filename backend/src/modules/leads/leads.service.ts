import { Types } from 'mongoose';
import { RequestContext } from '../../core/context.js';
import { ConflictError, NotFoundError } from '../../core/errors/index.js';
import { scopedFind, scopedFindOne, scopedCount } from '../../core/scoping/index.js';
import { Lead, type ILead } from './leads.model.js';
import { toObjectId } from '../../core/db/basePlugin.js';

export class LeadsService {
  /**
   * List leads with filtering, pagination, and scoping rules applied.
   */
  static async listLeads(
    filters: any,
    ctx: RequestContext,
  ): Promise<{ leads: ILead[]; total: number }> {
    const query: Record<string, any> = {};

    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      query.$or = [{ companyName: searchRegex }, { mobile: searchRegex }];
    }

    if (filters.status) query.status = filters.status;
    if (filters.city) query.city = filters.city;
    if (filters.source) query.source = filters.source;

    // By default, scopedFind scopes to `assignedTo` for regular roles if we pass ownerField.
    // However, if the user explicitly asks for unassigned leads (for the pool),
    // we bypass the normal scope filter.
    
    // Actually, scoping forces `assignedTo: ctx.user.id` for agents.
    // To see the "Unclaimed" pool, an agent needs to bypass that specific scoping check.
    // But scopedFind handles this via UNSCOPED_ROLES.
    // For agents, we might need to manually handle the scope if they are viewing the unassigned pool.

    // Let's manually construct the scoping logic here to support the `unassigned` pool for agents.
    const isUnscoped = ['admin', 'manager', 'finance', 'hr', 'ops'].includes(ctx.user.role);

    if (filters.unassigned) {
      query.status = 'New';
      query.assignedTo = null;
    } else if (filters.assignedToMe) {
      query.assignedTo = toObjectId(ctx.user.id);
    } else if (filters.assignedTo) {
      query.assignedTo = toObjectId(filters.assignedTo);
    } else if (!isUnscoped) {
      // Regular agent, not looking at unassigned pool, restrict to their leads.
      query.assignedTo = toObjectId(ctx.user.id);
    }

    if (filters.fromDate || filters.toDate) {
      query.createdAt = {};
      if (filters.fromDate) query.createdAt.$gte = filters.fromDate;
      if (filters.toDate) query.createdAt.$lte = filters.toDate;
    }
    
    // Always exclude deleted
    query.deletedAt = null;

    const skip = (filters.page - 1) * filters.limit;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .populate('assignedTo', 'name email role')
        .exec(),
      Lead.countDocuments(query).exec(),
    ]);

    return { leads, total };
  }

  static async getLead(id: string, ctx: RequestContext): Promise<ILead> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError('Lead not found');

    const lead = await scopedFindOne(Lead, { _id: toObjectId(id) }, ctx, {
      ownerField: 'assignedTo',
    });
    
    if (!lead) throw new NotFoundError('Lead not found');

    await lead.populate('assignedTo', 'name email role');
    return lead;
  }

  static async createLead(data: any, ctx: RequestContext): Promise<ILead> {
    const lead = await Lead.create({
      ...data,
      createdBy: toObjectId(ctx.user.id),
      status: 'New',
    });
    return lead;
  }

  static async updateLead(id: string, data: any, ctx: RequestContext): Promise<ILead> {
    const lead = await LeadsService.getLead(id, ctx); // Ensures access

    if (data.status && data.status !== lead.status) {
      lead.status = data.status;
    }
    
    Object.assign(lead, data);

    await lead.save();
    return lead;
  }

  static async qualifyLead(id: string, qualificationData: any, ctx: RequestContext): Promise<ILead> {
    const lead = await LeadsService.getLead(id, ctx);
    lead.qualification = { ...lead.qualification, ...qualificationData };
    
    if (lead.status === 'New' || lead.status === 'Contacted') {
       lead.status = 'Interested'; // Auto transition or based on manual logic.
    }
    
    await lead.save();
    return lead;
  }

  static async claimLead(id: string, ctx: RequestContext): Promise<ILead> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError('Lead not found');

    const updated = await Lead.findOneAndUpdate(
      { _id: toObjectId(id), status: 'New', assignedTo: null, deletedAt: null },
      {
        $set: {
          assignedTo: toObjectId(ctx.user.id),
          status: 'Contacted',
          slaTimerEnd: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours SLA
          updatedBy: toObjectId(ctx.user.id),
        },
      },
      { new: true },
    ).populate('assignedTo', 'name email role');

    if (!updated) {
      // Either doesn't exist, is deleted, or someone else claimed it.
      const current = await Lead.findOne({ _id: toObjectId(id) });
      if (!current) throw new NotFoundError('Lead not found');
      if (current.assignedTo) {
        throw new ConflictError('Another agent has already claimed this lead.');
      }
      throw new ConflictError('Cannot claim this lead in its current state.');
    }

    return updated;
  }
}

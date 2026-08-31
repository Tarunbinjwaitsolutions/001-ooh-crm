import { RequestContext } from '../../core/context.js';
import { Campaign, type ICampaign } from './campaigns.model.js';
import { toObjectId } from '../../core/db/basePlugin.js';

export class CampaignsService {
  static async listCampaigns(ctx: RequestContext): Promise<Partial<ICampaign>[]> {
    return Campaign.find({ deletedAt: null }).sort({ createdAt: -1 }).lean().exec();
  }

  static async createCampaign(data: { name: string }, ctx?: RequestContext): Promise<ICampaign> {
    return Campaign.create({
      ...data,
      createdBy: ctx?.user?.id ? toObjectId(ctx.user.id) : null,
    });
  }

  static async createFromQuotation(
    quotationId: string,
    ctx?: RequestContext,
  ): Promise<ICampaign> {
    return Campaign.create({
      name: `Campaign from Quote ${quotationId}`,
      status: 'Draft',
      createdBy: ctx?.user?.id ? toObjectId(ctx.user.id) : null,
    });
  }
}

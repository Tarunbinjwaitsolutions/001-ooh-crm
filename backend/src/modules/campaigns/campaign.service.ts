import { ClientSession, Types } from "mongoose";

import { withOptionalTransaction } from "../../core/db/transaction.js";
import Campaign, {
  CampaignStatus,
  ICampaign,
} from "./campaign.model.js";
import { Quotation } from "../quotations/quotations.model.js";
import { createBooking } from "../bookings/booking.service.js";
import { Site } from "../sites/site.model.js";

type RequestContext = {
  userId: Types.ObjectId | string;
  role?: string;
};

type CreateCampaignInput = {
  name: string;
  leadId: string;
  quotationId?: string;
  city: string;
  startDate: Date;
  endDate: Date;
  siteIds: string[];
  contractedValue: number;
  assignedManager?: string;
};

type CampaignFilters = {
  status?: CampaignStatus;
  city?: string;
  manager?: string;
  startDate?: Date;
  endDate?: Date;
};

const STATUS_TRANSITIONS: Record<
  CampaignStatus,
  CampaignStatus[]
> = {
  [CampaignStatus.DRAFT]: [
    CampaignStatus.APPROVED,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.APPROVED]: [
    CampaignStatus.IN_PROGRESS,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.IN_PROGRESS]: [
    CampaignStatus.COMPLETED,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.COMPLETED]: [],
  [CampaignStatus.CANCELLED]: [],
};

function assertValidDates(
  start: Date,
  end: Date,
) {
  if (end <= start) {
    throw new Error(
      "endDate must be after startDate",
    );
  }
}

async function generateCampaignCode(
  session?: ClientSession,
) {
  const year = new Date().getFullYear();

  let query = Campaign.findOne({
    campaignCode: new RegExp(
      `^MO-C-${year}-`,
    ),
  }).sort({ campaignCode: -1 });

  if (session) {
    query = query.session(session);
  }

  const last = await query.lean();

  const number = last?.campaignCode
    ? Number(
        last.campaignCode.split("-").pop(),
      ) + 1
    : 1;

  return `MO-C-${year}-${String(
    number,
  ).padStart(4, "0")}`;
}

async function validateSitesExist(
  siteIds: string[],
  session?: ClientSession,
) {
  if (!siteIds.length) {
    throw new Error(
      "Campaign must have at least one site",
    );
  }

  const validIds = siteIds.filter((id) =>
    Types.ObjectId.isValid(id),
  );

  if (validIds.length !== siteIds.length) {
    const invalidIds = siteIds.filter(
      (id) => !Types.ObjectId.isValid(id),
    );
    throw new Error(
      `Invalid site ID(s): ${invalidIds.join(", ")}`,
    );
  }

  let query = Site.countDocuments({
    _id: { $in: validIds },
  });

  if (session) {
    query = query.session(session);
  }

  const count = await query;

  if (count !== validIds.length) {
    const found = await Site.find({
      _id: { $in: validIds },
    }).select("_id");

    const foundIds = new Set(
      found.map((s) => s._id.toString()),
    );
    const missingIds = validIds.filter(
      (id) => !foundIds.has(id),
    );

    throw new Error(
      `Site(s) not found: ${missingIds.join(", ")}`,
    );
  }
}

/**
 * Helper: Identify campaigns with invalid site references.
 * Returns a map of campaign ID → invalid site IDs.
 */
export async function identifyInvalidSites(): Promise<
  Array<{ campaignId: string; campaignCode: string; invalidSites: string[] }>
> {
  const campaigns = await Campaign.find().lean();

  const allSiteIds = new Set(
    (
      await Site.find()
        .select("_id")
        .lean()
    ).map((s) => s._id.toString()),
  );

  const result: Array<{
    campaignId: string;
    campaignCode: string;
    invalidSites: string[];
  }> = [];

  for (const campaign of campaigns) {
    const invalidSites = (
      campaign.siteIds || []
    ).filter(
      (siteId: any) =>
        !allSiteIds.has(siteId.toString()),
    );

    if (invalidSites.length > 0) {
      result.push({
        campaignId: String(campaign._id),
        campaignCode: campaign.campaignCode,
        invalidSites: invalidSites.map((id) =>
          String(id),
        ),
      });
    }
  }

  return result;
}

/**
 * Repair campaigns by removing invalid site references.
 * Only removes sites if at least one valid site remains.
 */
export async function repairInvalidSites(): Promise<
  Array<{ campaignId: string; campaignCode: string; removed: number }>
> {
  const campaigns = await Campaign.find().lean();

  const allSiteIds = new Set(
    (
      await Site.find()
        .select("_id")
        .lean()
    ).map((s) => s._id.toString()),
  );

  const repaired: Array<{
    campaignId: string;
    campaignCode: string;
    removed: number;
  }> = [];

  for (const campaign of campaigns) {
    const validSites = (
      campaign.siteIds || []
    ).filter(
      (siteId: any) =>
        allSiteIds.has(siteId.toString()),
    );

    const invalidCount =
      (campaign.siteIds || []).length -
      validSites.length;

    if (invalidCount === 0) {
      continue;
    }

    // Never leave a campaign with zero sites
    if (validSites.length === 0) {
      console.warn(
        `Campaign ${campaign.campaignCode} has no valid sites — skipping to prevent data loss`,
      );
      continue;
    }

    await Campaign.updateOne(
      { _id: campaign._id },
      { siteIds: validSites },
    );

    repaired.push({
      campaignId: String(campaign._id),
      campaignCode: campaign.campaignCode,
      removed: invalidCount,
    });
  }

  return repaired;
}
export async function createCampaign(
  input: CreateCampaignInput,
  ctx: RequestContext,
): Promise<ICampaign> {
  assertValidDates(
    input.startDate,
    input.endDate,
  );

  return withOptionalTransaction(
    async (session) => {
      let quotation = null;

      if (input.quotationId) {
        quotation =
          await Quotation.findOne({
            _id: input.quotationId,
            deletedAt: null,
          }).session(session ?? null);

        if (!quotation) {
          throw new Error(
            "Quotation not found",
          );
        }

        const existing =
          await Campaign.findOne({
            quotationId: quotation._id,
          }).session(session ?? null);

        if (existing) {
          return existing;
        }
      }

      // Validate all sites exist before creating campaign
      await validateSitesExist(
        input.siteIds,
        session ?? undefined,
      );

      const campaign =
        new Campaign({
          campaignCode:
            await generateCampaignCode(
              session,
            ),
          name: input.name,
          leadId: new Types.ObjectId(
            input.leadId,
          ),
          quotationId:
            quotation?._id,
          city: input.city,
          startDate: input.startDate,
          endDate: input.endDate,
          siteIds: input.siteIds.map(
            (id) => new Types.ObjectId(id),
          ),
          contractedValue:
            input.contractedValue,
          status: CampaignStatus.DRAFT,
          assignedManager:
            input.assignedManager
              ? new Types.ObjectId(
                  input.assignedManager,
                )
              : undefined,
        });

      await campaign.save({
        session,
      });

      return campaign;
    },
  );
}

/* Create campaign from accepted quotation */
export async function createFromQuotation(
  quotationId: string,
  ctx: RequestContext,
): Promise<ICampaign> {
  return withOptionalTransaction(
    async (session) => {
      const quotation =
        await Quotation.findOne({
          _id: quotationId,
          deletedAt: null,
        }).session(session ?? null);

      if (!quotation) {
        throw new Error(
          "Quotation not found",
        );
      }

      const existing =
        await Campaign.findOne({
          quotationId: quotation._id,
        }).session(session ?? null);

      if (existing) {
        return existing;
      }

      const sites = quotation.sites ?? [];

      if (!sites.length) {
        throw new Error(
          "Quotation has no sites",
        );
      }

      const startDate = new Date(
        Math.min(
          ...sites.map((site) =>
            new Date(
              site.startDate,
            ).getTime(),
          ),
        ),
      );

      const endDate = new Date(
        Math.max(
          ...sites.map((site) =>
            new Date(
              site.endDate,
            ).getTime(),
          ),
        ),
      );

      assertValidDates(
        startDate,
        endDate,
      );

      // Validate all sites exist before creating campaign
      const siteIds = sites.map(
        (site) => String(site.siteId),
      );
      await validateSitesExist(
        siteIds,
        session ?? undefined,
      );

      const campaign =
        new Campaign({
          campaignCode:
            await generateCampaignCode(
              session,
            ),
          name:
            quotation.clientName ||
            "Campaign",
          leadId: quotation.leadId,
          quotationId: quotation._id,
          city: "",
          startDate,
          endDate,
          siteIds: sites.map(
            (site) => site.siteId,
          ),
          contractedValue:
            quotation.total,
          status: CampaignStatus.DRAFT,
        });

      await campaign.save({
        session,
      });

      return campaign;
    },
  );
}

/* Campaign list */
export async function listCampaigns(
  filters: CampaignFilters,
  ctx: RequestContext,
) {
  const query: Record<string, any> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.city) {
    query.city = new RegExp(
      filters.city,
      "i",
    );
  }

  if (filters.manager) {
    query.assignedManager =
      new Types.ObjectId(
        filters.manager,
      );
  }

  if (
    filters.startDate ||
    filters.endDate
  ) {
    query.startDate = {};

    if (filters.startDate) {
      query.startDate.$gte =
        filters.startDate;
    }

    if (filters.endDate) {
      query.endDate =
        filters.endDate;
    }
  }

  return Campaign.find(query)
    .populate(
      "leadId",
      "name company email",
    )
    .populate(
      "quotationId",
      "quoteNumber total sites",
    )
    .populate(
      "siteIds",
      "name city baseCostPerDay",
    )
    .populate(
      "assignedManager",
      "name email",
    )
    .sort({ createdAt: -1 });
}

/* Get campaign */
export async function getCampaign(
  id: string,
  ctx: RequestContext,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(
      "Invalid campaign id",
    );
  }

  const campaign =
    await Campaign.findById(id)
      .populate(
        "leadId",
        "name company email phone",
      )
      .populate(
        "quotationId",
        "quoteNumber total sites",
      )
      .populate(
        "siteIds",
        "name city size baseCostPerDay",
      )
      .populate(
        "assignedManager",
        "name email",
      );

  if (!campaign) {
    throw new Error(
      "Campaign not found",
    );
  }

  return campaign;
}

/* Update campaign status */
export async function updateCampaignStatus(
  id: string,
  nextStatus: CampaignStatus,
  ctx: RequestContext,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(
      "Invalid campaign id",
    );
  }

  return withOptionalTransaction(
    async (session) => {
      const campaign =
        await Campaign.findById(id).session(
          session ?? null,
        );

      if (!campaign) {
        throw new Error(
          "Campaign not found",
        );
      }

      if (
        campaign.status === nextStatus
      ) {
        throw new Error(
          `Campaign is already ${nextStatus}`,
        );
      }

      if (
        !STATUS_TRANSITIONS[
          campaign.status
        ].includes(nextStatus)
      ) {
        throw new Error(
          `Invalid campaign status transition: ${campaign.status} → ${nextStatus}`,
        );
      }

      if (
        nextStatus ===
        CampaignStatus.APPROVED
      ) {
        // Validate all sites still exist before approval
        await validateSitesExist(
          campaign.siteIds.map((id) =>
            String(id),
          ),
          session ?? undefined,
        );

        await Promise.all(
          campaign.siteIds.map(
            (siteId) =>
              createBooking({
                siteId: String(siteId),
                campaignId: String(
                  campaign._id,
                ),
                from: campaign.startDate,
                to: campaign.endDate,
              }),
          ),
        );
      }

      campaign.status = nextStatus;

      await campaign.save({
        session,
      });

      return campaign;
    },
  );
}
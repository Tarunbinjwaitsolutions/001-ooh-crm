import mongoose, {
  ClientSession,
  Types,
} from "mongoose";
import { withOptionalTransaction } from "../../core/db/transaction.js";

import Campaign, {
  CampaignStatus,
  ICampaign,
} from "./campaign.model.js";

import { createBooking } from "../bookings/booking.service.js";

const Quotation =
  mongoose.models.Quotation ??
  mongoose.model(
    "Quotation",
    new mongoose.Schema({}, { strict: false }),
  );

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

function isValidTransition(
  current: CampaignStatus,
  next: CampaignStatus,
): boolean {
  return STATUS_TRANSITIONS[current].includes(next);
}

function assertValidDates(
  startDate: Date,
  endDate: Date,
): void {
  if (endDate <= startDate) {
    throw new Error("endDate must be after startDate");
  }
}

async function generateCampaignCode(
  session?: ClientSession,
): Promise<string> {
  const year = new Date().getFullYear();

  let query = Campaign.findOne({
    campaignCode: new RegExp(`^MO-C-${year}-`),
  }).sort({ campaignCode: -1 });

  if (session) {
    query = query.session(session);
  }

  const lastCampaign = await query.lean();

  let sequence = 1;

  if (lastCampaign?.campaignCode) {
    const parts = lastCampaign.campaignCode.split("-");

    const lastNumber = Number(parts[parts.length - 1]);

    if (Number.isFinite(lastNumber)) {
      sequence = lastNumber + 1;
    }
  }

  return `MO-C-${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Create campaign directly.
 */
export async function createCampaign(
  input: CreateCampaignInput,
  ctx: RequestContext,
): Promise<ICampaign> {
  assertValidDates(
    input.startDate,
    input.endDate,
  );

  return withOptionalTransaction(async (session) => {
    const quotationIdToUse = input.quotationId
      ? new Types.ObjectId(input.quotationId)
      : new Types.ObjectId();

    let quotationQuery = Quotation.findById(quotationIdToUse);
    if (session) {
      quotationQuery = quotationQuery.session(session);
    }
    let quotation = await quotationQuery;

    if (!quotation) {
      const quotationDoc = new Quotation({
        _id: quotationIdToUse,
        leadId: new Types.ObjectId(input.leadId),
        name: `Quote for ${input.name}`,
        campaignName: input.name,
        city: input.city,
        total: input.contractedValue,
        status: "Accepted",
      });

      const qSaveOptions: any = {};
      if (session) {
        qSaveOptions.session = session;
      }
      await quotationDoc.save(qSaveOptions);
      quotation = quotationDoc;
    }

    let existingCampaignQuery = Campaign.findOne({
      quotationId: quotation._id,
    });
    if (session) {
      existingCampaignQuery = existingCampaignQuery.session(session);
    }
    const existingCampaign = await existingCampaignQuery;

    if (existingCampaign) {
      throw new Error(
        "A campaign already exists for this quotation",
      );
    }

    const campaignCode =
      await generateCampaignCode(session);

    const campaign = new Campaign({
      campaignCode,

      name: input.name,

      leadId: new Types.ObjectId(input.leadId),

      quotationId: quotation._id,

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

    const saveOptions: any = {};
    if (session) {
      saveOptions.session = session;
    }
    await campaign.save(saveOptions);

    return campaign;
  });
}

/**
 * B3 calls this when client accepts quotation.
 *
 * Required by D1:
 * createFromQuotation(quotationId, ctx)
 */
export async function createFromQuotation(
  quotationId: string,
  ctx: RequestContext,
): Promise<ICampaign> {
  return withOptionalTransaction(async (session) => {
    let quotationQuery = Quotation.findById(quotationId);
    if (session) {
      quotationQuery = quotationQuery.session(session);
    }
    const quotation = await quotationQuery;

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    let existingCampaignQuery = Campaign.findOne({
      quotationId: new Types.ObjectId(quotationId),
    });
    if (session) {
      existingCampaignQuery = existingCampaignQuery.session(session);
    }
    const existingCampaign = await existingCampaignQuery;

    if (existingCampaign) {
      throw new Error(
        "Campaign already exists for this quotation",
      );
    }

    /*
     * These field names must match your quotation model.
     * D1 requires copying quotation line items
     * into campaign.siteIds and copying dates/value.
     */

    const lineItems =
      (quotation as any).lineItems ?? [];

    if (!lineItems.length) {
      throw new Error(
        "Quotation has no line items",
      );
    }

    const siteIds = lineItems.map(
      (item: any) =>
        new Types.ObjectId(item.siteId),
    );

    const startDates: Date[] = lineItems
      .map((item: any) => new Date(item.startDate))
      .filter((date: Date) => !isNaN(date.getTime()));

    const endDates: Date[] = lineItems
      .map((item: any) => new Date(item.endDate))
      .filter((date: Date) => !isNaN(date.getTime()));

    if (!startDates.length || !endDates.length) {
      throw new Error(
        "Quotation does not contain valid dates",
      );
    }

    const startDate = new Date(
      Math.min(
        ...startDates.map((date) =>
          date.getTime(),
        ),
      ),
    );

    const endDate = new Date(
      Math.max(
        ...endDates.map((date) =>
          date.getTime(),
        ),
      ),
    );

    assertValidDates(startDate, endDate);

    const contractedValue =
      Number(
        (quotation as any).total ??
          (quotation as any).totalAmount ??
          (quotation as any).contractedValue ??
          0,
      );

    const campaignCode =
      await generateCampaignCode(session);

    const campaign = new Campaign({
      campaignCode,

      name:
        (quotation as any).campaignName ??
        (quotation as any).name ??
        `Campaign ${campaignCode}`,

      leadId: quotation.leadId,

      quotationId:
        new Types.ObjectId(quotationId),

      city:
        (quotation as any).city ??
        "",

      startDate,

      endDate,

      siteIds,

      contractedValue,

      status: CampaignStatus.DRAFT,

      assignedManager: undefined,
    });

    const saveOptions: any = {};
    if (session) {
      saveOptions.session = session;
    }
    await campaign.save(saveOptions);

    return campaign;
  });
}

/**
 * Get campaign list.
 *
 * IMPORTANT:
 * Replace the query below with your project's
 * existing scoping layer if your repository requires
 * scopedFind/scopedQuery.
 */
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
      new Types.ObjectId(filters.manager);
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
      "quoteNumber total",
    )
    .populate(
      "siteIds",
      "name city baseCostPerDay",
    )
    .populate(
      "assignedManager",
      "name email",
    )
    .sort({
      createdAt: -1,
    });
}

/**
 * Get single campaign.
 */
export async function getCampaign(
  id: string,
  ctx: RequestContext,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid campaign id");
  }

  const campaign =
    await Campaign.findById(id)
      .populate(
        "leadId",
        "name company email phone",
      )
      .populate(
        "quotationId",
        "quoteNumber total lineItems",
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
    throw new Error("Campaign not found");
  }

  return campaign;
}

/**
 * Change campaign status.
 */
export async function updateCampaignStatus(
  id: string,
  nextStatus: CampaignStatus,
  ctx: RequestContext,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid campaign id");
  }

  return withOptionalTransaction(async (session) => {
    let campaignQuery = Campaign.findById(id);
    if (session) {
      campaignQuery = campaignQuery.session(session);
    }
    const campaign = await campaignQuery;

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const currentStatus = campaign.status;

    if (currentStatus === nextStatus) {
      throw new Error(`Campaign is already ${nextStatus}`);
    }

    if (!isValidTransition(currentStatus, nextStatus)) {
      throw new Error(
        `Invalid campaign status transition: ${currentStatus} → ${nextStatus}`,
      );
    }

    /*
     * D1:
     * Draft -> Approved
     *
     * Approval must book sites inside
     * the same transaction.
     */

    if (nextStatus === CampaignStatus.APPROVED) {
      await Promise.all(
        campaign.siteIds.map((siteId) =>
          createBooking({
            siteId: String(siteId),
            campaignId: String(campaign._id),
            from: campaign.startDate,
            to: campaign.endDate,
          }),
        ),
      );
    }

    campaign.status = nextStatus;

    const saveOptions: any = {};
    if (session) {
      saveOptions.session = session;
    }
    await campaign.save(saveOptions);

    return campaign;
  });
}
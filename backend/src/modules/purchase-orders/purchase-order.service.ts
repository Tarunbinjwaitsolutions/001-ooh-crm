import type { Request } from "express";
import mongoose from "mongoose";

import {
  PurchaseOrder,
  type IPurchaseOrderLineItem,
} from "./purchase-order.model.js";

import type {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from "./purchase-order.validator.js";

import { Vendor } from "../vendors/vendor.model.js";
import { Site } from "../sites/site.model.js";

type RequestContext = NonNullable<Request["ctx"]>;

function getUserId(
  ctx: RequestContext,
): mongoose.Types.ObjectId | undefined {
  const userId = ctx.user?.id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return undefined;
  }

  return new mongoose.Types.ObjectId(userId);
}

function calculateDays(
  from: Date,
  to: Date,
): number {
  const start = new Date(from);
  const end = new Date(to);

  if (end < start) {
    throw new Error(
      "To date cannot be before from date",
    );
  }

  return (
    Math.floor(
      (end.getTime() - start.getTime()) /
        86400000,
    ) + 1
  );
}

function buildLineItems(
  items: CreatePurchaseOrderInput["lineItems"],
): IPurchaseOrderLineItem[] {
  return items.map((item) => {
    if (!mongoose.isValidObjectId(item.siteId)) {
      throw new Error("Invalid site ID");
    }

    const from = new Date(item.from);
    const to = new Date(item.to);

    const days = calculateDays(from, to);

    const amount =
      item.negotiatedRatePerDay * days;

    return {
      siteId: new mongoose.Types.ObjectId(
        item.siteId,
      ),
      from,
      to,
      negotiatedRatePerDay:
        item.negotiatedRatePerDay,
      days,
      amount,
    };
  });
}

function calculateTotal(
  items: IPurchaseOrderLineItem[],
): number {
  return items.reduce(
    (total, item) => total + item.amount,
    0,
  );
}

async function generatePONumber(): Promise<string> {
  const year = new Date().getFullYear();

  const count =
    await PurchaseOrder.countDocuments({
      poNumber: {
        $regex: `^MO-PO-${year}-`,
      },
    });

  return `MO-PO-${year}-${String(
    count + 1,
  ).padStart(4, "0")}`;
}

export async function listPurchaseOrders() {
  return PurchaseOrder.find()
    .populate(
      "vendorId",
      "name city state",
    )
    .populate(
      "campaignId",
      "name",
    )
    .sort({
      createdAt: -1,
    })
    .lean();
}

export async function getPurchaseOrderById(
  id: string,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(
      "Invalid purchase order ID",
    );
  }

  const po =
    await PurchaseOrder.findById(id)
      .populate(
        "vendorId",
        "name city state",
      )
      .populate(
        "campaignId",
        "name",
      )
      .populate(
        "lineItems.siteId",
        "code city type baseCostPerDay",
      )
      .lean();

  if (!po) {
    throw new Error(
      "Purchase order not found",
    );
  }

  return po;
}

export async function createPurchaseOrder(
  input: CreatePurchaseOrderInput,
  ctx: RequestContext,
) {
  if (
    !mongoose.isValidObjectId(
      input.campaignId,
    )
  ) {
    throw new Error(
      "Invalid campaign ID",
    );
  }

  if (
    !mongoose.isValidObjectId(
      input.vendorId,
    )
  ) {
    throw new Error(
      "Invalid vendor ID",
    );
  }

  const vendor =
    await Vendor.findOne({
      _id: input.vendorId,
      deletedAt: null,
      status: "Active",
    });

  if (!vendor) {
    throw new Error(
      "Active vendor not found",
    );
  }

  for (const item of input.lineItems) {
    if (
      !mongoose.isValidObjectId(
        item.siteId,
      )
    ) {
      throw new Error(
        "Invalid site ID",
      );
    }

    const site =
      await Site.findById(item.siteId);

    if (!site) {
      throw new Error(
        `Site not found: ${item.siteId}`,
      );
    }

    if (site.status !== "Active") {
      throw new Error(
        `Site ${site.code} is inactive`,
      );
    }
  }

  const lineItems =
    buildLineItems(
      input.lineItems,
    );

  const totalAmount =
    calculateTotal(lineItems);

  const poNumber =
    await generatePONumber();

  const userId = getUserId(ctx);

  const po =
    await PurchaseOrder.create({
      poNumber,

      campaignId:
        new mongoose.Types.ObjectId(
          input.campaignId,
        ),

      vendorId:
        new mongoose.Types.ObjectId(
          input.vendorId,
        ),

      lineItems,

      totalAmount,

      status: "Draft",

      createdBy: userId,

      updatedBy: userId,
    });

  return po.toObject();
}

export async function updatePurchaseOrder(
  id: string,
  input: UpdatePurchaseOrderInput,
  ctx: RequestContext,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(
      "Invalid purchase order ID",
    );
  }

  const existing =
    await PurchaseOrder.findById(id);

  if (!existing) {
    throw new Error(
      "Purchase order not found",
    );
  }

  if (existing.status !== "Draft") {
    throw new Error(
      "Only Draft purchase orders can be edited",
    );
  }

  if (input.vendorId) {
    if (
      !mongoose.isValidObjectId(
        input.vendorId,
      )
    ) {
      throw new Error(
        "Invalid vendor ID",
      );
    }

    const vendor =
      await Vendor.findOne({
        _id: input.vendorId,
        deletedAt: null,
        status: "Active",
      });

    if (!vendor) {
      throw new Error(
        "Active vendor not found",
      );
    }

    existing.vendorId =
      new mongoose.Types.ObjectId(
        input.vendorId,
      );
  }

  if (input.lineItems) {
    const lineItems =
      buildLineItems(
        input.lineItems,
      );

    for (const item of lineItems) {
      const site =
        await Site.findById(item.siteId);

      if (!site) {
        throw new Error(
          `Site not found: ${item.siteId}`,
        );
      }

      if (site.status !== "Active") {
        throw new Error(
          `Site ${site.code} is inactive`,
        );
      }
    }

    existing.lineItems =
      lineItems;

    existing.totalAmount =
      calculateTotal(lineItems);
  }

  existing.updatedBy =
    getUserId(ctx);

  await existing.save();

  return existing.toObject();
}

export async function issuePurchaseOrder(
  id: string,
  ctx: RequestContext,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(
      "Invalid purchase order ID",
    );
  }

  const po =
    await PurchaseOrder.findById(id);

  if (!po) {
    throw new Error(
      "Purchase order not found",
    );
  }

  if (po.status !== "Draft") {
    throw new Error(
      "Only Draft purchase orders can be issued",
    );
  }

  /*
   * Recalculate before issuing.
   * Never trust stored totals.
   */
  let total = 0;

  po.lineItems.forEach((item) => {
    const days =
      calculateDays(
        item.from,
        item.to,
      );

    const amount =
      item.negotiatedRatePerDay *
      days;

    item.days = days;
    item.amount = amount;

    total += amount;
  });

  po.totalAmount = total;

  po.status = "Issued";

  po.issuedAt = new Date();

  po.updatedBy =
    getUserId(ctx);

  /*
   * PDF generation should use
   * the existing core/pdf service.
   */

  await po.save();

  return po.toObject();
}

export async function cancelPurchaseOrder(
  id: string,
  ctx: RequestContext,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(
      "Invalid purchase order ID",
    );
  }

  const po =
    await PurchaseOrder.findById(id);

  if (!po) {
    throw new Error(
      "Purchase order not found",
    );
  }

  if (po.status === "Cancelled") {
    return po.toObject();
  }

  po.status = "Cancelled";

  po.updatedBy =
    getUserId(ctx);

  await po.save();

  return po.toObject();
}
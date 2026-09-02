import type { Request } from "express";
import mongoose from "mongoose";

import { Vendor } from "./vendor.model.js";
import { Site } from "../sites/site.model.js";

import type {
  CreateVendorInput,
  UpdateVendorInput,
} from "./vendor.validator.js";

type RequestContext =
  NonNullable<Request["ctx"]>;

interface VendorListFilters {
  search?: string;
  state?: string;
  city?: string;
}

function getRole(
  ctx: RequestContext,
): string {
  return String(
    (
      ctx as {
        user?: {
          role?: string;
        };
      }
    ).user?.role ?? "",
  );
}

function canViewBankDetails(
  ctx: RequestContext,
): boolean {
  const role = getRole(ctx);

  return (
    role === "Admin" ||
    role === "admin" ||
    role === "Finance" ||
    role === "finance"
  );
}

function sanitizeVendor(
  vendor: Record<string, any>,
  ctx: RequestContext,
) {
  if (!canViewBankDetails(ctx)) {
    delete vendor.bankAccountNumber;
    delete vendor.ifsc;
  }

  return vendor;
}

/* ----------------------------------
   LIST VENDORS
----------------------------------- */

export async function listVendors(
  ctx: RequestContext,
  filters: VendorListFilters = {},
) {
  const { search, state, city } = filters;

  const filter: Record<string, any> = {
    deletedAt: null,
  };

  if (search?.trim()) {
    const value = search.trim();

    filter.$or = [
      { name: { $regex: value, $options: "i" } },
      { state: { $regex: value, $options: "i" } },
      { city: { $regex: value, $options: "i" } },
      {
        contactPerson: {
          $regex: value,
          $options: "i",
        },
      },
      {
        mobile: {
          $regex: value,
          $options: "i",
        },
      },
      {
        panNumber: {
          $regex: value,
          $options: "i",
        },
      },
      {
        msmeNumber: {
          $regex: value,
          $options: "i",
        },
      },
      {
        gstNumber: {
          $regex: value,
          $options: "i",
        },
      },
    ];
  }

  if (state?.trim()) {
    filter.state = {
      $regex: `^${state.trim()}$`,
      $options: "i",
    };
  }

  if (city?.trim()) {
    filter.city = {
      $regex: `^${city.trim()}$`,
      $options: "i",
    };
  }

  const vendors = await Vendor.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return vendors.map((vendor) =>
    sanitizeVendor(
      { ...vendor },
      ctx,
    ),
  );
}

/* ----------------------------------
   DYNAMIC FILTER OPTIONS
   State -> Cities
----------------------------------- */

export async function getVendorFilters(
  ctx: RequestContext,
  state?: string,
) {
  const stateFilter: Record<string, any> = {
    deletedAt: null,
  };

  if (state?.trim()) {
    stateFilter.state = {
      $regex: `^${state.trim()}$`,
      $options: "i",
    };
  }

  const vendors = await Vendor.find(
    stateFilter,
  )
    .select("state city")
    .lean();

  const states = [
    ...new Set(
      vendors
        .map((vendor) =>
          vendor.state?.trim(),
        )
        .filter(Boolean),
    ),
  ].sort();

  const cities = [
    ...new Set(
      vendors
        .map((vendor) =>
          vendor.city?.trim(),
        )
        .filter(Boolean),
    ),
  ].sort();

  const stateSummary = await Vendor.aggregate([
    {
      $match: {
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: {
          state: "$state",
          city: "$city",
        },
        vendorCount: {
          $sum: 1,
        },
      },
    },
    {
      $group: {
        _id: "$_id.state",
        vendorCount: {
          $sum: "$vendorCount",
        },
        cities: {
          $addToSet: "$_id.city",
        },
      },
    },
    {
      $project: {
        _id: 0,
        state: "$_id",
        vendorCount: 1,
        cityCount: {
          $size: "$cities",
        },
        cities: 1,
      },
    },
    {
      $sort: {
        state: 1,
      },
    },
  ]);

  return {
    states: stateSummary,
    cities,
  };
}

/* ----------------------------------
   GET VENDOR BY ID
----------------------------------- */

export async function getVendorById(
  id: string,
  ctx: RequestContext,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid vendor ID");
  }

  const vendor = await Vendor.findOne({
    _id: id,
    deletedAt: null,
  }).lean();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  return sanitizeVendor(
    { ...vendor },
    ctx,
  );
}

/* ----------------------------------
   CREATE VENDOR
----------------------------------- */

export async function createVendor(
  input: CreateVendorInput,
  ctx: RequestContext,
) {
  const vendor = await Vendor.create({
    ...input,
    createdBy: ctx.user?.id,
    updatedBy: ctx.user?.id,
  });

  return sanitizeVendor(
    vendor.toObject(),
    ctx,
  );
}

/* ----------------------------------
   UPDATE VENDOR
----------------------------------- */

export async function updateVendor(
  id: string,
  input: UpdateVendorInput,
  ctx: RequestContext,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid vendor ID");
  }

  const vendor =
    await Vendor.findOneAndUpdate(
      {
        _id: id,
        deletedAt: null,
      },
      {
        $set: {
          ...input,
          updatedBy: ctx.user?.id,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  return sanitizeVendor(
    { ...vendor },
    ctx,
  );
}

/* ----------------------------------
   DEACTIVATE VENDOR
----------------------------------- */

export async function deactivateVendor(
  id: string,
  ctx: RequestContext,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid vendor ID");
  }

  const vendor =
    await Vendor.findOneAndUpdate(
      {
        _id: id,
        deletedAt: null,
      },
      {
        $set: {
          status: "Inactive",
          updatedBy: ctx.user?.id,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  return sanitizeVendor(
    { ...vendor },
    ctx,
  );
}

export async function getSitesByVendor(
  id: string,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid vendor ID");
  }

  return Site.find({
    vendorId: id,
    deletedAt: null,
  })
    .select("code city type status")
    .sort({ code: 1 })
    .lean();
}
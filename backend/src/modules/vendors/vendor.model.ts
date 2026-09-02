import mongoose, { Schema } from "mongoose";

export type VendorStatus =
  | "Active"
  | "Inactive";

export interface IVendor {
  name: string;
  state: string;
  city: string;
  contactPerson?: string;
  mobile?: string;
  email?: string;
  address?: string;
  panNumber?: string;
  msmeNumber?: string;
  gstNumber?: string;
  paymentTerms?: string;
  bankAccountNumber?: string;
  ifsc?: string;
  status: VendorStatus;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    contactPerson: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    msmeNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    paymentTerms: {
      type: String,
      trim: true,
    },

    bankAccountNumber: {
      type: String,
      trim: true,
    },

    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

vendorSchema.index({
  state: 1,
  city: 1,
});

export const Vendor =
  mongoose.model<IVendor>(
    "Vendor",
    vendorSchema,
  );
import mongoose, { Schema } from "mongoose";

export type PurchaseOrderStatus =
  | "Draft"
  | "Issued"
  | "Accepted"
  | "Cancelled";

export interface IPurchaseOrderLineItem {
  siteId: mongoose.Types.ObjectId;
  from: Date;
  to: Date;
  negotiatedRatePerDay: number;
  days: number;
  amount: number;
}

export interface IPurchaseOrder {
  poNumber: string;
  campaignId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  lineItems: IPurchaseOrderLineItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  issuedAt?: Date;
  pdfKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const lineItemSchema = new Schema<IPurchaseOrderLineItem>(
  {
    siteId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Site",
    },

    from: {
      type: Date,
      required: true,
    },

    to: {
      type: Date,
      required: true,
    },

    negotiatedRatePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    days: {
      type: Number,
      required: true,
      min: 1,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    campaignId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Campaign",
      index: true,
    },

    vendorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Vendor",
      index: true,
    },

    lineItems: {
      type: [lineItemSchema],
      required: true,

      validate: {
        validator: (value: IPurchaseOrderLineItem[]) =>
          Array.isArray(value) && value.length > 0,

        message: "At least one line item is required",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Issued",
        "Accepted",
        "Cancelled",
      ],
      default: "Draft",
      index: true,
    },

    issuedAt: {
      type: Date,
    },

    pdfKey: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const PurchaseOrder = mongoose.model<IPurchaseOrder>(
  "PurchaseOrder",
  purchaseOrderSchema,
);
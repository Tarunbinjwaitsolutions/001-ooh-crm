import mongoose, { Schema } from "mongoose";

export interface ISiteBooking {
  siteId: mongoose.Types.ObjectId;
  date: Date;
  campaignId: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const siteBookingSchema = new Schema<ISiteBooking>(
  {
    siteId: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    campaignId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    quotationId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * Prevent the same site from being
 * booked twice on the same date.
 */
siteBookingSchema.index(
  {
    siteId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

export const SiteBooking =
  mongoose.model<ISiteBooking>(
    "SiteBooking",
    siteBookingSchema,
  );
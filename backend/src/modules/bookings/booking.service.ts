import mongoose from "mongoose";
import { withOptionalTransaction } from "../../core/db/transaction.js";

import {
  Site,
  SiteStatus,
} from "../sites/site.model.js";

import { SiteBooking } from "./site-booking.model.js";

function normalizeDateUTC(
  date: Date,
): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

function generateDates(
  from: Date,
  to: Date,
): Date[] {
  const dates: Date[] = [];

  let current = normalizeDateUTC(from);
  const end = normalizeDateUTC(to);

  while (current <= end) {
    dates.push(new Date(current));

    current = new Date(
      current.getTime() +
        24 * 60 * 60 * 1000,
    );
  }

  return dates;
}

interface CreateBookingInput {
  siteId: string;
  campaignId: string;
  quotationId?: string;
  from: Date;
  to: Date;
}

/*
 * CREATE BOOKING
 *
 * One document is created for every date.
 * Transaction + unique index prevents
 * double booking.
 */
export async function createBooking(
  data: CreateBookingInput,
) {
  return withOptionalTransaction(async (session) => {
    let siteQuery = Site.findById(data.siteId);
    if (session) {
      siteQuery = siteQuery.session(session);
    }
    const site = await siteQuery;

    if (!site) {
      throw new Error("Site not found");
    }

    if (site.status !== SiteStatus.ACTIVE) {
      throw new Error(`Site ${site.code} is not active`);
    }

    const dates = generateDates(data.from, data.to);

    const documents = dates.map((date) => ({
      siteId: data.siteId,
      date,
      campaignId: data.campaignId,
      quotationId: data.quotationId,
    }));

    try {
      const insertOptions: any = { ordered: true };
      if (session) {
        insertOptions.session = session;
      }
      const bookings = await SiteBooking.insertMany(documents, insertOptions);
      return bookings;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new Error(
          `Site ${site.code} is already booked for one or more selected dates`,
        );
      }
      throw error;
    }
  });
}

/*
 * SITE AVAILABILITY
 */
export async function getSiteAvailability(
  siteId: string,
  from: Date,
  to: Date,
) {
  const start =
    normalizeDateUTC(from);

  const end =
    normalizeDateUTC(to);

  return SiteBooking.find({
    siteId,
    date: {
      $gte: start,
      $lte: end,
    },
  })
    .sort({
      date: 1,
    })
    .lean();
}

/*
 * GET BOOKED SITE IDS
 *
 * Used by C1 Site Registry to determine
 * Available / Booked.
 */
export async function getBookedSiteIds(
  from: Date,
  to: Date,
): Promise<string[]> {
  const start =
    normalizeDateUTC(from);

  const end =
    normalizeDateUTC(to);

  const bookings =
    await SiteBooking.find({
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .select("siteId")
      .lean();

  return [
    ...new Set(
      bookings.map((booking: { siteId: mongoose.Types.ObjectId }) =>
        String(booking.siteId),
      ),
    ),
  ];
}

/*
 * GET AVAILABLE SITES
 *
 * Kept for existing C2 API.
 */
export async function getAvailableSites(
  city: string,
  from: Date,
  to: Date,
) {
  const bookedSiteIds =
    await getBookedSiteIds(
      from,
      to,
    );

  return Site.find({
    city,
    status: SiteStatus.ACTIVE,
    _id: {
      $nin: bookedSiteIds,
    },
  })
    .populate('vendorId', 'name city')
    .sort({ code: 1 })
    .lean();
}

/*
 * RELEASE CAMPAIGN BOOKINGS
 */
export async function releaseCampaignBookings(
  campaignId: string,
) {
  const result =
    await SiteBooking.deleteMany({
      campaignId,
    });

  return {
    released:
      result.deletedCount,
  };
}
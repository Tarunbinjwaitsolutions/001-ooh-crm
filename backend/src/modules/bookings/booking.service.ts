import { Types } from "mongoose";

import { withOptionalTransaction } from "../../core/db/transaction.js";
import {
  Site,
  SiteStatus,
} from "../sites/site.model.js";
import { SiteBooking } from "./site-booking.model.js";

function normalizeDateUTC(date: Date): Date {
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
      current.getTime() + 86400000,
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

export async function createBooking(
  data: CreateBookingInput,
) {
  return withOptionalTransaction(async (session) => {
    if (!Types.ObjectId.isValid(data.siteId)) {
      throw new Error(
        `Invalid site id: ${data.siteId}`,
      );
    }

    const site = await Site.findById(
      data.siteId,
    ).session(session ?? null);

    if (!site) {
      throw new Error(
        `Site not found: ${data.siteId}`,
      );
    }

    if (site.status !== SiteStatus.ACTIVE) {
      throw new Error(
        `Site ${site.code} is not active`,
      );
    }

    const dates = generateDates(
      data.from,
      data.to,
    );

    const documents = dates.map((date) => ({
      siteId: new Types.ObjectId(
        data.siteId,
      ),
      date,
      campaignId: new Types.ObjectId(
        data.campaignId,
      ),
      ...(data.quotationId
        ? {
            quotationId:
              new Types.ObjectId(
                data.quotationId,
              ),
          }
        : {}),
    }));

    try {
      return await SiteBooking.insertMany(
        documents,
        {
          ordered: true,
          ...(session ? { session } : {}),
        },
      );
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

export async function getSiteAvailability(
  siteId: string,
  from: Date,
  to: Date,
) {
  return SiteBooking.find({
    siteId,
    date: {
      $gte: normalizeDateUTC(from),
      $lte: normalizeDateUTC(to),
    },
  })
    .sort({ date: 1 })
    .lean();
}

export async function getBookedSiteIds(
  from: Date,
  to: Date,
): Promise<string[]> {
  const bookings = await SiteBooking.find({
    date: {
      $gte: normalizeDateUTC(from),
      $lte: normalizeDateUTC(to),
    },
  })
    .select("siteId")
    .lean();

  return [
    ...new Set(
      bookings.map((booking) =>
        String(booking.siteId),
      ),
    ),
  ];
}

export async function getAvailableSites(
  city: string,
  from: Date,
  to: Date,
) {
  const bookedSiteIds =
    await getBookedSiteIds(from, to);

  return Site.find({
    city,
    status: SiteStatus.ACTIVE,
    _id: {
      $nin: bookedSiteIds,
    },
  })
    .populate(
      "vendorId",
      "name city",
    )
    .sort({ code: 1 })
    .lean();
}

export async function releaseCampaignBookings(
  campaignId: string,
) {
  const result =
    await SiteBooking.deleteMany({
      campaignId,
    });

  return {
    released: result.deletedCount,
  };
}
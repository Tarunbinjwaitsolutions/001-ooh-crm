import mongoose from "mongoose";

import {
  Site,
  SiteStatus,
  SiteType,
  ISite,
} from "./site.model.js";

import {
  CreateSiteInput,
  UpdateSiteInput,
} from "./site.validator.js";

/* ----------------------------------
   TYPES
----------------------------------- */

interface SiteFilters {
  city?: string;
  type?: SiteType;
  status?: SiteStatus;
  search?: string;
}

/* ----------------------------------
   CITY CODE
----------------------------------- */

function getCityCode(city: string): string {
  const code = city
    .replace(/[^A-Za-z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  return code.padEnd(3, "X");
}

/* ----------------------------------
   INDIA GPS VALIDATION
----------------------------------- */

function isInsideIndia(
  lat: number,
  lng: number
): boolean {
  const minLat = 6;
  const maxLat = 37.5;

  const minLng = 68;
  const maxLng = 97.5;

  return (
    lat >= minLat &&
    lat <= maxLat &&
    lng >= minLng &&
    lng <= maxLng
  );
}

/* ----------------------------------
   GENERATE SITE CODE
----------------------------------- */

async function generateSiteCode(
  city: string,
  type: SiteType,
  session: mongoose.ClientSession
): Promise<string> {
  const cityCode = getCityCode(city);

  const typeCode = type
    .replace(/\s+/g, "-")
    .toUpperCase();

  /*
    Counter document is stored in MongoDB.

    We use a collection directly here so
    we don't need another model file.
  */

  const counterCollection =
    mongoose.connection.collection(
      "site_counters"
    );

  const key =
    `${cityCode}-${typeCode}`;

  const result =
    await counterCollection.findOneAndUpdate(
      {
        id: key,
      },
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        session,
      }
    );

  const sequence =
    result?.sequence ?? 1;

  return `${cityCode}-${typeCode}-${String(
    sequence
  ).padStart(3, "0")}`;
}

/* ----------------------------------
   CREATE SITE
----------------------------------- */

export async function createSite(
  data: CreateSiteInput
): Promise<ISite> {
  const session =
    await mongoose.startSession();

  try {
    let createdSite: ISite | null = null;

    await session.withTransaction(
      async () => {
        /*
          1. Validate GPS
        */

        if (
          !isInsideIndia(
            data.gps.lat,
            data.gps.lng
          )
        ) {
          throw new Error(
            "GPS coordinates must fall within India"
          );
        }

        /*
          2. Generate unique code
        */

        const code =
          await generateSiteCode(
            data.city,
            data.type,
            session
          );

        /*
          3. Create site
        */

        const sites =
          await Site.create(
            [
              {
                ...data,
                code,
              },
            ],
            {
              session,
            }
          );

        createdSite = sites[0];
      }
    );

    if (!createdSite) {
      throw new Error(
        "Site creation failed"
      );
    }

    return createdSite;
  } finally {
    await session.endSession();
  }
}

/* ----------------------------------
   GET SITES
----------------------------------- */

export async function getSites(
  filters: SiteFilters
) {
  const query: Record<string, any> = {};

  if (filters.city) {
    query.city = filters.city;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search) {
    query.$or = [
      {
        code: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        city: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        address: {
          $regex: filters.search,
          $options: "i",
        },
      },
    ];
  }

  return Site.find(query)
    .sort({
      createdAt: -1,
    })
    .lean();
}

/* ----------------------------------
   GET SINGLE SITE
----------------------------------- */

export async function getSiteById(
  id: string
) {
  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new Error("Invalid site ID");
  }

  const site =
    await Site.findById(id).lean();

  if (!site) {
    throw new Error(
      "Site not found"
    );
  }

  return site;
}

/* ----------------------------------
   UPDATE SITE
----------------------------------- */

export async function updateSite(
  id: string,
  data: UpdateSiteInput
) {
  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new Error("Invalid site ID");
  }

  /*
    Validate GPS when GPS is updated.
  */

  if (data.gps) {
    if (
      !isInsideIndia(
        data.gps.lat,
        data.gps.lng
      )
    ) {
      throw new Error(
        "GPS coordinates must fall within India"
      );
    }
  }

  /*
    Code is never accepted from the client.
  */

  const updateData: any = {
    ...data,
  };

  delete updateData.code;

  const site =
    await Site.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

  if (!site) {
    throw new Error(
      "Site not found"
    );
  }

  return site;
}

/* ----------------------------------
   CSV IMPORT
----------------------------------- */

interface CsvRow {
  city: string;
  type: string;
  address?: string;
  lat: number;
  lng: number;
  sizeWidth: number;
  sizeHeight: number;
  baseCostPerDay: number;
}

/*
  Simple CSV parser.

  Expected CSV:

  city,type,address,lat,lng,sizeWidth,sizeHeight,baseCostPerDay
  Mumbai,Airport,Mumbai Airport,19.0896,72.8656,40,20,500000
*/

function parseCsv(
  csv: string
): CsvRow[] {
  const lines = csv
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(
      "CSV must contain header and data"
    );
  }

  const headers = lines[0]
    .split(",")
    .map((header) =>
      header.trim()
    );

  return lines
    .slice(1)
    .map((line) => {
      const values =
        line.split(",").map((value) =>
          value.trim()
        );

      const row: any = {};

      headers.forEach(
        (header, index) => {
          row[header] = values[index];
        }
      );

      return {
        city: row.city,
        type: row.type,
        address: row.address,

        lat: Number(row.lat),
        lng: Number(row.lng),

        sizeWidth:
          Number(row.sizeWidth),

        sizeHeight:
          Number(row.sizeHeight),

        baseCostPerDay:
          Number(
            row.baseCostPerDay
          ),
      };
    });
}

/* ----------------------------------
   CSV VALIDATION
----------------------------------- */

function validateCsvRows(
  rows: CsvRow[]
) {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    if (!row.city) {
      errors.push(
        `Row ${rowNumber}: city is required`
      );
    }

    if (
      !Object.values(SiteType).includes(
        row.type as SiteType
      )
    ) {
      errors.push(
        `Row ${rowNumber}: invalid site type`
      );
    }

    if (
      Number.isNaN(row.lat) ||
      Number.isNaN(row.lng)
    ) {
      errors.push(
        `Row ${rowNumber}: invalid GPS`
      );
    }

    if (
      !Number.isNaN(row.lat) &&
      !Number.isNaN(row.lng) &&
      !isInsideIndia(
        row.lat,
        row.lng
      )
    ) {
      errors.push(
        `Row ${rowNumber}: GPS must be within India`
      );
    }

    if (
      row.sizeWidth <= 0 ||
      row.sizeHeight <= 0
    ) {
      errors.push(
        `Row ${rowNumber}: invalid dimensions`
      );
    }

    if (
      !Number.isInteger(
        row.baseCostPerDay
      ) ||
      row.baseCostPerDay < 0
    ) {
      errors.push(
        `Row ${rowNumber}: invalid base cost`
      );
    }
  });

  return errors;
}

/* ----------------------------------
   IMPORT CSV
----------------------------------- */

export async function importSitesFromCsv(
  csv: string
) {
  const rows = parseCsv(csv);

  /*
    IMPORTANT:
    Validate EVERYTHING first.
    Do not write anything if even one
    row contains an error.
  */

  const errors =
    validateCsvRows(rows);

  if (errors.length > 0) {
    return {
      success: false,
      imported: 0,
      errors,
    };
  }

  const session =
    await mongoose.startSession();

  try {
    let importedSites: ISite[] = [];

    await session.withTransaction(
      async () => {
        for (const row of rows) {
          const code =
            await generateSiteCode(
              row.city,
              row.type as SiteType,
              session
            );

          const sites =
            await Site.create(
              [
                {
                  code,

                  city: row.city,

                  type:
                    row.type as SiteType,

                  address:
                    row.address,

                  gps: {
                    lat: row.lat,
                    lng: row.lng,
                  },

                  sizeWidth:
                    row.sizeWidth,

                  sizeHeight:
                    row.sizeHeight,

                  baseCostPerDay:
                    row.baseCostPerDay,

                  vendorId: null,

                  status:
                    SiteStatus.ACTIVE,

                  photos: [],
                },
              ],
              {
                session,
              }
            );

          importedSites.push(
            sites[0]
          );
        }
      }
    );

    return {
      success: true,
      imported:
        importedSites.length,
      data: importedSites,
      errors: [],
    };
  } finally {
    await session.endSession();
  }
}
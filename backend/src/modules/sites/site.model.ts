import {
  Document,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export enum SiteType {
  AIRPORT = "Airport",
  HIGHWAY = "Highway",
  MALL = "Mall",
  METRO = "Metro",
  MARKET = "Market",
  OTHER = "Other",
}

export enum SiteStatus {
  ACTIVE = "Active",
  MAINTENANCE = "Maintenance",
  INACTIVE = "Inactive",
}

export interface IGps {
  lat: number;
  lng: number;
}

export interface ISite extends Document {
  code: string;
  city: string;
  type: SiteType;
  address?: string;

  gps: IGps;

  sizeWidth: number;
  sizeHeight: number;

  // Amount stored in paise
  baseCostPerDay: number;

  vendorId?: Types.ObjectId | null;

  status: SiteStatus;

  photos: string[];

  createdAt: Date;
  updatedAt: Date;
}

const gpsSchema = new Schema<IGps>(
  {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  {
    _id: false,
  }
);

const siteSchema = new Schema<ISite>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(SiteType),
      required: true,
    },

    address: {
      type: String,
      trim: true,
    },

    gps: {
      type: gpsSchema,
      required: true,
    },

    sizeWidth: {
      type: Number,
      required: true,
      min: 0,
    },

    sizeHeight: {
      type: Number,
      required: true,
      min: 0,
    },

    baseCostPerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(SiteStatus),
      default: SiteStatus.ACTIVE,
      index: true,
    },

    photos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Site: Model<ISite> =
  model<ISite>("Site", siteSchema);
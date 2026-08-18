import mongoose, { Schema, Types } from 'mongoose';

/**
 * Refresh tokens are opaque random strings. Only their SHA-256 hash is stored,
 * so the database never holds anything that can be replayed. Each refresh
 * rotates the token and revokes the one it replaced.
 */
export interface IRefreshToken {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenHash: string | null;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
    userAgent: { type: String },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken =
  (mongoose.models.RefreshToken as mongoose.Model<IRefreshToken>) ??
  mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

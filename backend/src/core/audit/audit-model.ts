import mongoose, { Schema, Types } from 'mongoose';

/**
 * The global change log. Append-only: nothing in this collection is ever
 * updated or deleted, which is the entire point of it. Module H1 reads it.
 *
 * Two things write here:
 *   1. `auditMiddleware` — automatically, for every successful mutation
 *   2. `auditService.record()` — from a service, when you want before/after
 */

export const AUDIT_ACTIONS = [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'login_failed',
  'export',
  'other',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface IAuditLog {
  _id: Types.ObjectId;

  actorId: Types.ObjectId | null;
  actorEmail: string | null;
  actorRole: string | null;

  action: AuditAction;
  /** Collection or resource name, e.g. "employees". */
  entity: string;
  entityId: string | null;

  /** Redacted request body, for the automatic middleware entries. */
  payload?: unknown;
  /** Field-level diff, when a service records one explicitly. */
  changes?: Array<{ field: string; from: unknown; to: unknown }>;

  method: string | null;
  path: string | null;
  statusCode: number | null;
  ip: string | null;
  userAgent: string | null;

  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    actorEmail: { type: String, default: null },
    actorRole: { type: String, default: null },

    action: { type: String, enum: AUDIT_ACTIONS, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, default: null },

    payload: { type: Schema.Types.Mixed },
    changes: [
      {
        _id: false,
        field: String,
        from: Schema.Types.Mixed,
        to: Schema.Types.Mixed,
      },
    ],

    method: { type: String, default: null },
    path: { type: String, default: null },
    statusCode: { type: Number, default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  {
    // Only createdAt — an audit entry is never updated.
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// The two queries H1 will run: "what happened to this record" and "what did this person do".
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog =
  (mongoose.models.AuditLog as mongoose.Model<IAuditLog>) ??
  mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

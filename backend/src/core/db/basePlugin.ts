import { Schema, Types, type Document } from 'mongoose';

/**
 * Standard fields on every document in the system. Apply this plugin to your
 * schema rather than hand-rolling them — the audit layer and the scoping layer
 * both rely on them being present and named exactly this.
 *
 *   employeeSchema.plugin(basePlugin);
 */
export interface BaseDocument extends Document {
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  /** Soft delete marker. Deletes set this; nothing is ever physically removed. */
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function basePlugin(schema: Schema) {
  schema.add({
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deletedAt: { type: Date, default: null },
  });

  // Mongoose maintains createdAt and updatedAt for us.
  schema.set('timestamps', true);
}

/**
 * Converts the string id on `ctx.user` into the ObjectId the schema expects.
 *
 *   await Employee.create({ ...payload, createdBy: actorId(ctx) });
 */
export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

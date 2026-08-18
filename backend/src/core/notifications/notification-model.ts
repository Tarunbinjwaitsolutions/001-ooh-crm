import mongoose, { Schema, Types } from 'mongoose';

/**
 * In-app notifications — the bell in the header.
 *
 * Every module emits these through `notify()`; nothing writes here directly.
 * Kept in core because a dozen modules produce them and one component consumes
 * them, so a per-module implementation would mean a dozen slightly different
 * shapes.
 */

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  /** Dot-namespaced, e.g. "leads.assigned", "leave.approved". */
  type: string;
  title: string;
  body?: string;
  /** In-app link, e.g. "/leads/64ab…". */
  link?: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    link: { type: String, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// The unread badge query, and the dropdown's list query.
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export const Notification =
  (mongoose.models.Notification as mongoose.Model<INotification>) ??
  mongoose.model<INotification>('Notification', notificationSchema);

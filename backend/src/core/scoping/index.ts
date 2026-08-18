import type { HydratedDocument, Model, QueryFilter, QueryOptions } from 'mongoose';

import type { RequestContext } from '../context.js';
import type { Role } from '../rbac/permissions.js';

/**
 * ROW-LEVEL SECURITY.
 *
 * MongoDB has none, so it lives here. Every read in every service goes through
 * this layer — a raw `Model.find()` in a service or controller is how one agent
 * ends up seeing another agent's leads, and this system stores PAN and Aadhaar
 * numbers.
 *
 *   // WRONG
 *   const leads = await Lead.find({ status: 'New' });
 *
 *   // RIGHT
 *   const leads = await scopedFind(Lead, { status: 'New' }, ctx);
 *
 * Two things happen automatically: soft-deleted records are excluded, and the
 * filter is narrowed to what the requesting user is allowed to see.
 */

/** Roles that see everything in the organisation rather than only their own records. */
const UNSCOPED_ROLES: readonly Role[] = ['admin', 'manager', 'finance', 'hr', 'ops'];

export interface ScopeOptions {
  /**
   * Field holding the owning user on this collection.
   * Leads use `assignedTo`; most other collections use `createdBy`.
   */
  ownerField?: string;
  /** Include soft-deleted records. Audit and admin views only. */
  includeDeleted?: boolean;
}

/**
 * Builds the scoping clause. Exported so a service that has to run an
 * aggregation can apply the same rule inside its `$match` stage.
 */
export function scopeFilter<T>(
  filter: QueryFilter<T>,
  ctx: RequestContext,
  options: ScopeOptions = {},
): QueryFilter<T> {
  const { ownerField = 'createdBy', includeDeleted = false } = options;

  const scoped = { ...filter } as Record<string, unknown>;

  if (!includeDeleted) {
    scoped.deletedAt = null;
  }

  if (!UNSCOPED_ROLES.includes(ctx.user.role)) {
    scoped[ownerField] = ctx.user.id;
  }

  return scoped as QueryFilter<T>;
}

export function scopedFind<T>(
  model: Model<T>,
  filter: QueryFilter<T>,
  ctx: RequestContext,
  options: ScopeOptions & { query?: QueryOptions<T> } = {},
) {
  return model.find(scopeFilter(filter, ctx, options), null, options.query);
}

export function scopedFindOne<T>(
  model: Model<T>,
  filter: QueryFilter<T>,
  ctx: RequestContext,
  options: ScopeOptions = {},
): Promise<HydratedDocument<T> | null> {
  return model
    .findOne(scopeFilter(filter, ctx, options))
    .exec() as Promise<HydratedDocument<T> | null>;
}

export function scopedCount<T>(
  model: Model<T>,
  filter: QueryFilter<T>,
  ctx: RequestContext,
  options: ScopeOptions = {},
): Promise<number> {
  return model.countDocuments(scopeFilter(filter, ctx, options)).exec();
}

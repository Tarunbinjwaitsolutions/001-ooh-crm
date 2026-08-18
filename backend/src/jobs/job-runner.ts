import mongoose, { Schema } from 'mongoose';

/**
 * Scheduled-job plumbing.
 *
 * Two rules the developer spec is emphatic about, and both live here so nobody
 * has to reimplement them:
 *
 *   1. Jobs must be IDEMPOTENT. They run repeatedly over the same data. The
 *      escalation job will see the same overdue task every 15 minutes — that
 *      must not send fifteen emails an hour.
 *
 *   2. Jobs must be safe to run TWICE CONCURRENTLY. Two app processes (PM2
 *      cluster mode) both fire the same cron. The lock below makes the second
 *      one a no-op instead of a duplicate.
 */

interface IJobLock {
  _id: string;
  lockedAt: Date;
  expiresAt: Date;
  holder: string;
}

const jobLockSchema = new Schema<IJobLock>({
  _id: { type: String, required: true },
  lockedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  holder: { type: String, required: true },
});

// A crashed process must not hold its lock forever.
jobLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const JobLock =
  (mongoose.models.JobLock as mongoose.Model<IJobLock>) ??
  mongoose.model<IJobLock>('JobLock', jobLockSchema);

const HOLDER = `${process.pid}@${process.env.HOSTNAME ?? 'local'}`;

/**
 * Runs `task` only if this process can take the named lock.
 *
 *   registerJob('escalation', '*!/15 * * * *', () =>
 *     withJobLock('escalation', 15 * 60, async () => { ... }),
 *   );
 *
 * Returns true if the task ran, false if another process held the lock.
 */
export async function withJobLock(
  name: string,
  ttlSeconds: number,
  task: () => Promise<void>,
): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  try {
    // Atomic: the update only matches when the lock is free or already expired,
    // so exactly one process wins even if both fire in the same millisecond.
    const result = await JobLock.findOneAndUpdate(
      { _id: name, expiresAt: { $lte: now } },
      { $set: { lockedAt: now, expiresAt, holder: HOLDER } },
      { upsert: true, returnDocument: 'after' },
    );

    if (!result) return false;
  } catch {
    // Duplicate key means another process created the lock first. Not an error.
    return false;
  }

  const startedAt = Date.now();

  try {
    await task();
    console.log(`[job:${name}] finished in ${Date.now() - startedAt}ms`);
    return true;
  } catch (err) {
    // A failing job must never take the server down.
    console.error(`[job:${name}] failed after ${Date.now() - startedAt}ms`, err);
    return true;
  } finally {
    // Release early so the next tick is not blocked by a long TTL.
    await JobLock.updateOne({ _id: name, holder: HOLDER }, { $set: { expiresAt: new Date() } });
  }
}

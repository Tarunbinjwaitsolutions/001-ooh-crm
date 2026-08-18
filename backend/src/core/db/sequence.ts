import mongoose, { Schema } from 'mongoose';

/**
 * Atomic, gap-free-ish counters for human-readable document numbers:
 * `MO-EMP-0001`, `MO-Q-2026-0001`, `MO-PO-2026-0001`.
 *
 * A single `findOneAndUpdate` with `$inc` and `upsert` is atomic in MongoDB, so
 * two concurrent creates can never receive the same number. Do NOT read the
 * highest existing document and add one — that races, and duplicate quote
 * numbers on a client-facing PDF are not a bug you want to explain.
 */

interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

const Counter =
  (mongoose.models.Counter as mongoose.Model<ICounter>) ??
  mongoose.model<ICounter>('Counter', counterSchema);

/** Returns the next value in the named sequence, starting at 1. */
export async function nextSequence(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true },
  );

  return counter.seq;
}

/**
 * Formats the next number in a sequence.
 *
 *   await formattedSequence('employee', 'MO-EMP', 4)   // 'MO-EMP-0001'
 *   await formattedSequence(`quote-${year}`, `MO-Q-${year}`, 4)
 */
export async function formattedSequence(name: string, prefix: string, padTo = 4): Promise<string> {
  const seq = await nextSequence(name);
  return `${prefix}-${String(seq).padStart(padTo, '0')}`;
}

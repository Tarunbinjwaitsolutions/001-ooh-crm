import mongoose from 'mongoose';

/**
 * Runs `fn` inside a MongoDB transaction when the connection supports
 * transactions (replica-set or Atlas), or without a session when it does not
 * (e.g. standalone dev MongoDB).
 *
 * Usage:
 *   return withOptionalTransaction(async (session) => {
 *     await Doc.create([...], { session });
 *   });
 */
export async function withOptionalTransaction<T>(
  fn: (session: mongoose.ClientSession | undefined) => Promise<T>
): Promise<T> {
  let session: mongoose.ClientSession | undefined;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    // If transactions are not supported (standalone), fall back to no session
    const errMsg = (err as Error).message ?? '';
    if (
      errMsg.includes('Transaction numbers are only allowed') ||
      errMsg.includes('does not support transactions') ||
      errMsg.includes('not supported') ||
      errMsg.includes('MongoServerError')
    ) {
      if (session) {
        try { await session.abortTransaction(); } catch { /* ignore */ }
      }
      // Retry without a transaction
      return fn(undefined);
    }
    if (session) {
      try { await session.abortTransaction(); } catch { /* ignore */ }
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

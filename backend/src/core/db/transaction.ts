import mongoose, { ClientSession } from 'mongoose';

/**
 * Execute an operation within a MongoDB transaction if transactions are supported
 * by the deployment (replica set or mongos). If the deployment is standalone
 * (which throws "does not support retryable writes" or "Transaction numbers are only allowed on a replica set member"),
 * it gracefully falls back to executing the operation without a transaction session.
 */
export async function withOptionalTransaction<T>(
  fn: (session?: ClientSession) => Promise<T>,
): Promise<T> {
  let session: ClientSession | null = null;

  try {
    session = await mongoose.startSession();
    let result: T | undefined;

    await session.withTransaction(async () => {
      result = await fn(session!);
    });

    return result as T;
  } catch (error: any) {
    const isUnsupported =
      error?.message?.includes('retryable writes') ||
      error?.message?.includes('replica set') ||
      error?.message?.includes('Transaction numbers') ||
      error?.message?.includes('standalone') ||
      error?.codeName === 'IllegalOperation' ||
      error?.code === 20;

    if (isUnsupported) {
      // Execute directly without a transaction session for standalone local MongoDB
      return await fn(undefined);
    }

    throw error;
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch {
        // Ignore session cleanup errors
      }
    }
  }
}


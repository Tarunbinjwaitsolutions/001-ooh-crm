import { config } from '../../config/index.js';
import type { StorageAdapter } from './types.js';

/**
 * S3-compatible object storage — NOT IMPLEMENTED YET.
 *
 * Target is Cloudflare R2 or Backblaze B2 (both cheap, both S3-compatible).
 * Proof photos and documents must not live on the VPS disk: it fills up, and
 * disk-based backups of a growing photo library become unmanageable.
 *
 * To implement:
 *   1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *   2. Fill in the five methods below against the interface in types.ts
 *   3. Set STORAGE_DRIVER=s3 plus the STORAGE_* variables in .env
 *
 * Nothing that calls the file service has to change — that is the whole reason
 * this sits behind an adapter interface from day one.
 */
function notImplemented(): never {
  throw new Error(
    'S3 storage is not implemented yet. Use STORAGE_DRIVER=local for development, ' +
      'or implement s3-adapter.ts (see the comment at the top of the file).',
  );
}

export const s3StorageAdapter: StorageAdapter = {
  name: config.storage.bucket ? `s3:${config.storage.bucket}` : 's3',
  async put() {
    notImplemented();
  },
  async get() {
    notImplemented();
  },
  async url() {
    notImplemented();
  },
  async remove() {
    notImplemented();
  },
  async exists() {
    notImplemented();
  },
};

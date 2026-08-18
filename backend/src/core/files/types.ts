export interface StoredFile {
  /** Storage key — the path inside the bucket. Store this on your document. */
  key: string;
  url: string;
  size: number;
  contentType: string;
  originalName: string;
}

export interface StorageAdapter {
  readonly name: string;
  put(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<{ key: string; size: number }>;
  get(key: string): Promise<Buffer>;
  /** A URL the browser can fetch. Signed and time-limited for object storage. */
  url(key: string): Promise<string>;
  remove(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

/** Mirrors the backend's `{ error: { code, message, details } }` envelope. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Field-level messages, for showing errors next to inputs. */
  fieldErrors(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const detail of this.details ?? []) {
      if (detail.field) map[detail.field] = detail.message;
    }
    return map;
  }
}

/** Turns anything thrown into a message safe to show a user. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) {
    return 'Cannot reach the server. Is the API running on the configured URL?';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

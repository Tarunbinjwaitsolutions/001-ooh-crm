/**
 * Frontend configuration. Everything comes from NEXT_PUBLIC_* env vars —
 * see .env.example.
 */
export const appConfig = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, ''),
  appName: 'Media Octus CRM',
} as const;

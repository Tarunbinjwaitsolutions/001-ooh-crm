/**
 * Display helpers.
 *
 * Money is stored and transported as **integer paise**. Convert to rupees here,
 * at the moment of display, and nowhere else — never in a calculation.
 */

/** 125000000 → "₹12,50,000.00" (Indian digit grouping). */
export function formatPaise(paise: number | undefined | null): string {
  if (paise === undefined || paise === null) return '—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paise / 100);
}

/** 125000000 → "1250000" — for pre-filling a rupee input on the edit form. */
export function paiseToRupeeInput(paise: number | undefined | null): string {
  if (paise === undefined || paise === null) return '';
  return String(paise / 100);
}

/** ISO string → "15 Jan 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** ISO string → "2026-01-15", the format an <input type="date"> expects. */
export function toDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

/** Years and months since joining. */
export function tenure(dateOfJoining: string): string {
  const start = new Date(dateOfJoining);
  const now = new Date();

  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) return 'Not started yet';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  if (remainingMonths === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years}y ${remainingMonths}m`;
}

/** "Rukmini Desai" → "RD", for the avatar circle. */
export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

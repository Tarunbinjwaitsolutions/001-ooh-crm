import type {
  CampaignStatus,
} from "./types";

export function formatCampaignDate(
  value?: string,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCampaignValue(
  paise?: number,
): string {
  if (
    paise === undefined ||
    paise === null
  ) {
    return "₹0";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(paise / 100);
}

export function formatCampaignStatus(
  status: CampaignStatus,
): string {
  if (status === "InProgress") {
    return "In Progress";
  }

  return status;
}

export function getCampaignManagerName(
  manager:
    | string
    | {
        _id: string;
        name?: string;
      }
    | null
    | undefined,
): string {
  if (!manager) {
    return "Unassigned";
  }

  if (typeof manager === "string") {
    return manager;
  }

  return manager.name || "Unassigned";
}
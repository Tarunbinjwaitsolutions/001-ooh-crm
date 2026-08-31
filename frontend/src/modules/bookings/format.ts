export function formatBookingDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCost(
  rupees: number,
) {
  return (
    rupees
  ).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}
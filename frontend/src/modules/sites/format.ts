export function formatCost(
  paise: number
) {
  return (
    paise / 100
  ).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}
export function formatPrice(value: number, symbol = "$"): string {
  return `${symbol}${Math.round(value).toLocaleString("en-US")}`;
}

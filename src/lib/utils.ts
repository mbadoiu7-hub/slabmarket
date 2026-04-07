export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(price);
}
dexport function calculateBuyerFee(price: number, platform: string): number {
  const feePercent = platform === 'slab' ? 0.05 : 0.10;
  return price * feePercent;
}
dexport function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds > 302400) return `${Math.floor(seconds / 302400)}d`;
  if (seconds > 3600) return `${Math.floor(seconds / 3600)}h`;
  if (seconds > 60) return `${Math.floor(seconds / 60)}m`;
  return `${seconds}s`;
}

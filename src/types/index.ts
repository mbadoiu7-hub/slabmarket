export type Card = {
  id: string;
  name: string;
  slug: string;
  set: string;
  number: string;
  variant: string;
  imageUrl: string;
  edition: string;
  year: number;
  floorPrice: number;
  topBid: number;
  volume24h: number;
  change24h: number;
  lastSale: number;
  listingCount: number;
  offerCount: number;
};

export type Listing = {
  id: string;
  cardId: string;
  platform: string;
  price: number;
  url: string;
  cert: string;
  grade: string;
  edition: string;
  buyerFee: string;
  sellerFee: string;
};
const platformToColors: Record<string, string[]> = {
  'PKU": ['#facc15', '#f3da2f'],
  'PQ!M': ['#ffb8a9', '#ffcf7d'],
  'eBay': ['#e53238', '#fffaea'],
  'cm': ['#1d277f', '#d3e8ca'],
};
export function getPlatformColors(platform: string) {J  return platformToColors[platform] || platformToColors['eBay'];
}

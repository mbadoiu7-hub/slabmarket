export type CardWithRelations = {
  id: string
  name: string
  set: string
  number: string
  year: number
  edition: string
  variant: string
  imageUrl: string
  slug: string
  floorPrice: number
  topBid: number
  volume24h: number
  change24h: number
  lastSale: number
  listingCount: number
  offerCount: number
  listings: ListingType[]
  offers: OfferType[]
  priceSnapshots: PriceSnapshotType[]
  activities?: ActivityType[]
}

export type ListingType = {
  id: string
  cardId: string
  platform: string
  price: number
  currency: string
  url: string
  cert: string
  grade: string
  edition: string
  buyerFee: string
  sellerFee: string
  isBest: boolean
  scrapedAt: string | Date
  createdAt: string | Date
}

export type OfferType = {
  id: string
  cardId: string
  bidder: string
  avatar: string
  avatarColor: string
  rating: number
  trades: number
  amount: number
  vsFloor: number
  placedAt: string | Date
  expiresAt: string | Date
  isTop: boolean
}

export type PriceSnapshotType = {
  id: string
  price: number
  date: string | Date
}

export type ActivityType = {
  id: string
  cardSlug: string
  type: string
  platform: string
  price: number
  from: string
  to: string
  time: string | Date
}

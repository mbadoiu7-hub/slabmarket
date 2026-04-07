import { prisma } from '@/lib/prisma'
import { Ticker } from '@/components/Ticker'
import { TrendingStrip } from '@/components/TrendingStrip'
import { OffersStrip } from '@/components/OffersStrip'
import { VolumeTable } from '@/components/VolumeTable'

export const dynamic = 'force-dynamic'

async function getCards() {
  const cards = await prisma.card.findMany({
    include: {
      _count: {
        select: { listings: true, offers: true },
      },
    },
    orderBy: { volume24h: 'desc' },
  })

  return cards.map((card) => ({
    ...card,
    listingCount: card._count.listings,
    offerCount: card._count.offers,
    listings: [],
    offers: [],
    priceSnapshots: [],
    activities: [],
  }))
}

export default async function Home() {
  const allCards = await getCards()

  const trendingCards = [...allCards].sort((a, b) => b.change24h - a.change24h)
  const topOffers = allCards
    .filter((c) => c.topBid > 0)
    .sort((a, b) => b.topBid - a.topBid)
    .slice(0, 4)

  const totalVolume = allCards.reduce((sum, c) => sum + c.volume24h, 0)
  const totalListings = allCards.reduce((sum, c) => sum + c.listingCount, 0)
  const avgFloor =
    allCards.length > 0
      ? Math.round(allCards.reduce((sum, c) => sum + c.floorPrice, 0) / allCards.length)
      : 0

  const tickerStats = [
    { label: 'Listings', value: totalListings.toLocaleString() },
    { label: '24h Volume', value: `€${Math.round(totalVolume).toLocaleString()}` },
    { label: 'Avg Floor', value: `€${avgFloor.toLocaleString()}` },
    { label: 'Sellers', value: Math.floor(totalListings / 3).toLocaleString() },
    { label: 'Cards', value: allCards.length.toString() },
    {
      label: 'Top Gainer',
      value: `+${Math.max(...allCards.map((c) => c.change24h)).toFixed(1)}%`,
      color: 'green' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <Ticker stats={tickerStats} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Trending */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-lg font-bold text-t1">
              Trending by 24h Change
            </h2>
          </div>
          <TrendingStrip cards={trendingCards.slice(0, 6)} />
        </div>

        {/* Top Offers */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-lg font-bold text-t1">Top Offers</h2>
          </div>
          <OffersStrip cards={topOffers} />
        </div>

        {/* Volume Table */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-lg font-bold text-t1">
              Biggest Volume
            </h2>
          </div>
          <VolumeTable cards={allCards} />
        </div>
      </div>
    </div>
  )
}

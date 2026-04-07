import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CardTabs } from '@/components/CardTabs'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getCardData(slug: string) {
  const card = await prisma.card.findUnique({
    where: { slug },
    include: {
      listings: { orderBy: { price: 'asc' } },
      offers: { orderBy: { amount: 'desc' } },
      priceSnapshots: { orderBy: { date: 'asc' } },
      activities: { orderBy: { time: 'desc' }, take: 50 },
      _count: { select: { listings: true, offers: true } },
    },
  })

  if (!card) return null

  return {
    ...card,
    listingCount: card._count.listings,
    offerCount: card._count.offers,
  }
}

function getEditionBadge(edition: string) {
  const badges: Record<string, { label: string; cls: string }> = {
    '1st Edition': { label: '1st Edition', cls: 'bg-gold text-bg' },
    Unlimited: { label: 'Unlimited', cls: 'bg-card text-t3 border border-line' },
    Shadowless: { label: 'Shadowless', cls: 'bg-blue text-bg' },
  }
  return badges[edition] || null
}

export default async function CardDetail({
  params,
}: {
  params: { slug: string }
}) {
  const card = await getCardData(params.slug)
  if (!card) notFound()

  const editionBadge = getEditionBadge(card.edition)
  const bestListing = card.listings.find((l) => l.isBest)
  const bestPlatform = bestListing?.platform === 'slab' ? 'SlabMarket native' : bestListing?.platform?.toUpperCase()

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-line bg-raised px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-t2 hover:text-orange transition-colors"
          >
            ← Collections
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          {/* Card Image */}
          <div className="flex items-center justify-center rounded-xl border border-line bg-card p-6 min-h-[440px]">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-[220px] drop-shadow-2xl hover:scale-[1.04] hover:-rotate-[0.5deg] transition-transform duration-500"
            />
          </div>

          {/* Card Info */}
          <div className="flex flex-col gap-4 py-2">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded px-2 py-1 font-mono text-xs font-bold bg-blue bg-opacity-15 text-blue">
                PSA 10
              </span>
              {editionBadge && (
                <span className={`rounded px-2 py-1 font-mono text-xs font-bold ${editionBadge.cls}`}>
                  {editionBadge.label}
                </span>
              )}
              {bestListing && (
                <span className="rounded px-2 py-1 font-mono text-xs font-bold bg-orange text-white">
                  ★ BEST DEAL
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-[1.9rem] font-black leading-tight tracking-tight text-t1">
              {card.name}
            </h1>
            <p className="text-sm text-t2">
              {card.set} · #{card.number} · {card.variant} · {card.year}
            </p>

            {/* Floor Price Box */}
            <div className="rounded-lg border border-line bg-card p-4">
              <p className="font-mono text-[0.58rem] uppercase tracking-widest text-t3 mb-1">
                Floor Price
              </p>
              <p className="font-mono text-2xl font-bold text-orange tracking-tight">
                {formatPrice(card.floorPrice)}
              </p>
              {bestListing && (
                <p className="mt-1 font-mono text-xs text-t3">
                  Buyer fee:{' '}
                  <span className={bestListing.buyerFee === '0%' ? 'text-green font-semibold' : ''}>
                    {bestListing.buyerFee}
                  </span>
                  {' '}· via {bestPlatform}
                </p>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-line bg-card p-3">
                <p className="font-mono text-[0.55rem] uppercase tracking-widest text-t3 mb-1">Listings</p>
                <p className="font-mono text-base font-bold text-t1">{card.listingCount}</p>
              </div>
              <div className="rounded-lg border border-line bg-card p-3">
                <p className="font-mono text-[0.55rem] uppercase tracking-widest text-t3 mb-1">Top Bid</p>
                <p className="font-mono text-base font-bold text-green">{formatPrice(card.topBid)}</p>
              </div>
              <div className="rounded-lg border border-line bg-card p-3">
                <p className="font-mono text-[0.55rem] uppercase tracking-widest text-t3 mb-1">Last Sale</p>
                <p className="font-mono text-base font-bold text-t1">{formatPrice(card.lastSale)}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-1">
              <button className="flex-1 rounded-lg bg-orange px-6 py-3 font-bold text-white transition-opacity hover:opacity-85">
                Buy Floor — {formatPrice(card.floorPrice)}
              </button>
              <button className="rounded-lg border border-line px-6 py-3 font-bold text-t2 transition-colors hover:border-orange hover:text-orange">
                Watch
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <CardTabs card={card as any} />
      </div>
    </div>
  )
}

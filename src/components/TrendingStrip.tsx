import Link from 'next/link'
import { CardWithRelations } from '@/types'
import { formatPrice, cn } from '@/lib/utils'

interface TrendingStripProps {
  cards: CardWithRelations[]
}

export function TrendingStrip({ cards }: TrendingStripProps) {
  return (
    <>
      {/* Mobile: 2-column grid */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {cards.map((card, index) => (
          <Link
            key={card.id}
            href={`/card/${card.slug}`}
            className="group rounded-lg border border-line bg-card p-3 transition-all hover:border-orange hover:bg-card-hover"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-t3">
                #{index + 1}
              </span>
            </div>
            <div className="mb-2 h-28 w-full overflow-hidden rounded-md bg-raised">
              <img
                src={card.imageUrl}
                alt={card.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="mb-0.5 truncate font-sans text-xs font-bold text-t1 group-hover:text-orange">
              {card.name}
            </h3>
            <p className="mb-2 truncate text-[0.65rem] text-t3">
              {card.set} â¢ #{card.number}
            </p>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[0.6rem] font-bold uppercase text-t3">Floor</span>
              <span className="font-mono text-sm font-bold text-orange">
                {formatPrice(card.floorPrice)}
              </span>
            </div>
            <div
              className={cn(
                'font-mono text-xs font-bold',
                card.change24h >= 0 ? 'text-green' : 'text-red'
              )}
            >
              {card.change24h >= 0 ? '+' : ''}{card.change24h.toFixed(1)}%
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: horizontal scroll */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {cards.map((card, index) => (
          <Link
            key={card.id}
            href={`/card/${card.slug}`}
            className="group flex-shrink-0 w-48 rounded-lg border border-line bg-card p-4 transition-all hover:border-orange hover:bg-card-hover"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-t3">
                #{index + 1}
              </span>
            </div>
            <div className="mb-3 h-40 w-full overflow-hidden rounded-md bg-raised">
              <img
                src={card.imageUrl}
                alt={card.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="mb-1 truncate font-sans text-sm font-bold text-t1 group-hover:text-orange">
              {card.name}
            </h3>
            <p className="mb-3 truncate text-xs text-t3">
              {card.set} â¢ #{card.number}
            </p>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase text-t3">Floor</span>
              <span className="font-mono font-bold text-orange">
                {formatPrice(card.floorPrice)}
              </span>
            </div>
            <div
              className={cn(
                'font-mono text-sm font-bold',
                card.change24h >= 0 ? 'text-green' : 'text-red'
              )}
            >
              {card.change24h >= 0 ? '+' : ''}{card.change24h.toFixed(1)}%
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

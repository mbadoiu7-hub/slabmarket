import Link from 'next/link'
import { CardWithRelations } from '@/types'
import { formatPrice } from '@/lib/utils'

interface OffersStripProps {
  cards: CardWithRelations[]
}

export function OffersStrip({ cards }: OffersStripProps) {
  return (
    <>
      {/* Mobile: 2-column grid */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {cards.map((card) => {
          const spread =
            card.floorPrice > 0
              ? (((card.floorPrice - card.topBid) / card.floorPrice) * 100).toFixed(1)
              : '0'

          return (
            <Link
              key={card.id}
              href={`/card/${card.slug}`}
              className="group rounded-lg border border-line bg-card p-3 transition-all hover:border-orange hover:bg-card-hover"
            >
              <div className="h-24 w-full overflow-hidden rounded-md bg-raised mb-2">
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="truncate font-sans text-xs font-bold text-t1 group-hover:text-orange">
                {card.name}
              </h3>
              <p className="text-[0.65rem] text-t3 mb-2">{card.set}</p>
              <div className="flex justify-between mb-1">
                <div>
                  <p className="text-[0.6rem] font-bold uppercase text-t3">Bid</p>
                  <p className="font-mono text-xs font-bold text-green">
                    {formatPrice(card.topBid)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.6rem] font-bold uppercase text-t3">Floor</p>
                  <p className="font-mono text-xs font-bold text-orange">
                    {formatPrice(card.floorPrice)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[0.6rem] font-bold uppercase text-t3">Spread</p>
                <p className="font-mono text-xs font-bold text-red">{spread}%</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Desktop: horizontal scroll */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {cards.map((card) => {
          const spread =
            card.floorPrice > 0
              ? (((card.floorPrice - card.topBid) / card.floorPrice) * 100).toFixed(1)
              : '0'

          return (
            <Link
              key={card.id}
              href={`/card/${card.slug}`}
              className="group flex-shrink-0 w-56 rounded-lg border border-line bg-card p-4 transition-all hover:border-orange hover:bg-card-hover"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 h-32 w-full overflow-hidden rounded-md bg-raised">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="col-span-2">
                  <h3 className="truncate font-sans text-sm font-bold text-t1 group-hover:text-orange">
                    {card.name}
                  </h3>
                  <p className="text-xs text-t3">{card.set}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-t3">Top Bid</p>
                  <p className="font-mono font-bold text-green">
                    {formatPrice(card.topBid)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-t3">Floor</p>
                  <p className="font-mono font-bold text-orange">
                    {formatPrice(card.floorPrice)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase text-t3">Spread</p>
                  <p className="font-mono font-bold text-red">{spread}%</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

import Link from 'next/link'
import { CardWithRelations } from '@/types'
import { formatPrice, cn } from '@/lib/utils'

interface VolumeTableProps {
  cards: CardWithRelations[]
}

export function VolumeTable({ cards }: VolumeTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">
              #
            </th>
            <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">
              Collection
            </th>
            <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
              Floor
            </th>
            <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
              Top Bid
            </th>
            <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
              24h Vol
            </th>
            <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
              24h %
            </th>
            <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
              Listings
            </th>
            <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
              Offers
            </th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card, index) => (
            <tr
              key={card.id}
              className="border-b border-line-light hover:bg-card-hover transition-colors"
            >
              <td className="px-4 py-3 font-mono text-t2 font-bold">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/card/${card.slug}`}
                  className="flex items-center gap-3 hover:text-orange transition-colors"
                >
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-8 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="font-bold text-t1 hover:text-orange">
                      {card.name}
                    </p>
                    <p className="text-xs text-t3">{card.set}</p>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-orange">
                {formatPrice(card.floorPrice)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-green">
                {formatPrice(card.topBid)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-t1">
                {formatPrice(card.volume24h)}
              </td>
              <td
                className={cn(
                  'px-4 py-3 text-right font-mono font-bold',
                  card.change24h >= 0 ? 'text-green' : 'text-red'
                )}
              >
                {card.change24h >= 0 ? '+' : ''}{card.change24h.toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-t1">
                {card.listingCount}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-t1">
                {card.offerCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

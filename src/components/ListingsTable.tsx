'use client'

import { useState } from 'react'
import { CardWithRelations, ListingType } from '@/types'
import { formatPrice, timeAgo } from '@/lib/utils'
import { PLATFORMS } from '@/lib/platforms'
import { CheckoutModal } from './CheckoutModal'

interface ListingsTableProps {
  card: CardWithRelations
}

export function ListingsTable({ card }: ListingsTableProps) {
  const [selectedListing, setSelectedListing] = useState<ListingType | null>(
    null
  )

  const platformConfig: Record<string, any> = {
    slab: { tag: 'SLAB', bg: 'bg-orange', textColor: 'text-bg' },
    ebay: { tag: 'EBAY', bg: 'bg-purple', textColor: 'text-bg' },
    pwcc: { tag: 'PWCC', bg: 'bg-green', textColor: 'text-bg' },
    cm: { tag: 'CARDMKT', bg: 'bg-red', textColor: 'text-bg' },
  }

  const sortedListings = [...card.listings].sort((a, b) => a.price - b.price)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">
                Platform
              </th>
              <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
                Price
              </th>
              <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
                Fees
              </th>
              <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">
                Cert
              </th>
              <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">
                Listed
              </th>
              <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedListings.map((listing) => {
              const config = platformConfig[listing.platform] || {
                tag: listing.platform.toUpperCase(),
                bg: 'bg-t3',
                textColor: 'text-bg',
              }
              const totalPrice =
                listing.price +
                (listing.buyerFee
                  ? parseFloat(listing.buyerFee.replace('%', '')) / 100 * listing.price
                  : 0)

              return (
                <tr
                  key={listing.id}
                  className={`border-b border-line-light hover:bg-card-hover transition-colors ${
                    listing.isBest ? 'bg-green bg-opacity-5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${config.bg} ${config.textColor}`}
                      >
                        {config.tag}
                      </span>
                      {listing.isBest && (
                        <span className="text-xs font-bold text-green">
                          BEST
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-orange">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-t2">
                    {listing.buyerFee}
                  </td>
                  <td className="px-4 py-3 font-mono text-t1">{listing.cert}</td>
                  <td className="px-4 py-3 text-t2">
                    {timeAgo(listing.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="px-3 py-1 rounded bg-orange text-bg font-bold text-xs hover:opacity-90 transition-opacity"
                    >
                      Buy
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedListing && (
        <CheckoutModal
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          listing={selectedListing}
          card={card}
        />
      )}
    </>
  )
}

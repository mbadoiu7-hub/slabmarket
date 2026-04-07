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
  
return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
  
       5ïbUdræ
        </table>
      </div>
    </>
  
  
 "è £Ü!ÄCFunction
                      <button
                        onClick={() => setSelectedListing(null)}
                        className="px-s py-1 rounded bg-orange text-bg font-bold text-xs hover:opacity-90 transition-opacity"
                       >
                         Close
                      </button>
                    </div>
    </>
  
 "è £Ü!ÄCFunction
    )
}

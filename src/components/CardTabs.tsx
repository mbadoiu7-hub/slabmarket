'use client'

import { useState } from 'react'
import { CardWithRelations } from '@/types'
import { ListingsTable } from './ListingsTable'
import { OffersPanel } from './OffersPanel'
import { PriceChart } from './PriceChart'
import { ActivityTable } from './ActivityTable'

interface CardTabsProps {
  card: CardWithRelations
}

export function CardTabs({ card }: CardTabsProps) {
  const [activeTab, setActiveTab] = useState<
    'listings' | 'offers' | 'price-history' | 'activity'
  >('listings')

  const tabs = [
    { id: 'listings', label: 'Listings' },
    { id: 'offers', label: 'Offers' },
    { id: 'price-history', label: 'Price History' },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <div className="rounded-lg border border-line bg-card overflow-hidden">
      {/* Tab Headers */}
      <div className="flex items-center border-b border-line bg-card-hover px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-4 px-6 font-mono text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? 'text-orange border-b-2 border-orange'
                : 'text-t2 hover:text-t1 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'listings' && <ListingsTable card={card} />}
        {activeTab === 'offers' && <OffersPanel card={card} />}
        {activeTab === 'price-history' && (
          <PriceChart snapshots={card.priceSnapshots} />
        )}
        {activeTab === 'activity' && <ActivityTable card={card} />}
      </div>
    </div>
  )
}

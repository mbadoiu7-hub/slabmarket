'use client'

import { useState } from 'react'
import { CardWithRelations, OfferType } from '@/types'
import { formatPrice, formatPriceDecimal } from '@/lib/utils'

interface OffersPanelProps {
  card: CardWithRelations
}

export function OffersPanel({ card }: OffersPanelProps) {
  const [offerAmount, setOfferAmount] = useState('')
  const [expiryDays, setExpiryDays] = useState('7')

  const sortedOffers = [...card.offers].sort((a, b) => b.amount - a.amount)

  const offerNum = parseFloat(offerAmount) || 0
  const vsFloor = card.floorPrice > 0 ? offerNum - card.floorPrice : 0
  const percentVsFloor =
    card.floorPrice > 0 ? ((vsFloor / card.floorPrice) * 100).toFixed(1) : '0'

  const handlePlaceOffer = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      amount: offerNum,
      expiryDays,
    })
    setOfferAmount('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {sortedOffers.length > 0 ? (
          <>
            <div className="space-y-2 md:hidden">
              {sortedOffers.map((offer) => {
                const vsFloorOffer = offer.amount - card.floorPrice
                const percentVsFloorOffer =
                  card.floorPrice > 0
                    ? ((vsFloorOffer / card.floorPrice) * 100).toFixed(1)
                    : '0'

                return (
                  <div
                    key={offer.id}
                    className={`rounded-lg border p-3 ${
                      offer.isTop ? 'border-green bg-green bg-opacity-5' : 'border-line bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold text-bg"
                          style={{ backgroundColor: offer.avatarColor }}
                        >
                          {offer.avatar[0]}
                        </div>
                        <div>
                          <p className="text-sm text-t1 font-bold">{offer.bidder}</p>
                          <p className="text-[0.65rem] text-t3">
                            {offer.trades} trades â¢ {offer.rating}â­
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-green">
                          {formatPrice(offer.amount)}
                        </p>
                        <p className={`font-mono text-xs font-bold ${vsFloorOffer >= 0 ? 'text-green' : 'text-red'}`}>
                          {vsFloorOffer >= 0 ? '+' : ''}{percentVsFloorOffer}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">Bidder</th>
                    <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">Bid</th>
                    <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">vs Floor</th>
                    <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOffers.map((offer) => {
                    const vsFloorOffer = offer.amount - card.floorPrice
                    const percentVsFloorOffer =
                      card.floorPrice > 0
                        ? ((vsFloorOffer / card.floorPrice) * 100).toFixed(1)
                        : '0'

                    return (
                      <tr
                        key={offer.id}
                        className={`border-b border-line-light hover:bg-card-hover transition-colors ${offer.isTop ? 'bg-green bg-opacity-5' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold text-bg"
                              style={{ backgroundColor: offer.avatarColor }}
                            >
                              {offer.avatar[0]}
                            </div>
                            <div>
                              <p className="text-t1 font-bold">{offer.bidder}</p>
                              <p className="text-xs text-t3">{offer.trades} trades â¢ {offer.rating}â­</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-green">
                          {formatPrice(offer.amount)}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${vsFloorOffer >= 0 ? 'text-green' : 'text-red'}`}>
                          {vsFloorOffer >= 0 ? '+' : ''}{percentVsFloorOffer}%
                        </td>
                        <td className="px-4 py-3 text-t2 text-xs">Expires in 3d</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-line bg-card-hover p-8 text-center">
            <p className="text-t3 text-sm">No offers yet</p>
          </div>
        )}
      </div>
      <div className="lg:col-span-1">
        <form
          onSubmit={handlePlaceOffer}
          className="rounded-lg border border-line bg-card-hover p-4 space-y-4"
        >
          <h3 className="font-sans font-bold text-t1">Place Offer</h3>
          <div>
            <label className="mb-2 block font-mono text-xs font-bold text-t3">
              Your Bid (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-card border border-line rounded px-3 py-2 font-mono text-t1 placeholder-t3 focus:border-orange focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs font-bold text-t3">
              Expires In
            </label>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-full bg-card border border-line rounded px-3 py-2 font-sans text-t1 focus:border-orange focus:outline-none"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          <div className="space-y-2 border-t border-line pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-t3">Floor Price</span>
              <span className="font-mono font-bold text-t1">
                {formatPrice(card.floorPrice)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-t3">vs Floor</span>
              <span
                className={`font-mono font-bold ${
                  vsFloor >= 0 ? 'text-green' : 'text-red'
                }`}
              >
                {vsFloor >= 0 ? '+' : ''}{percentVsFloor}%
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!offerAmount}
            className="w-full px-3 py-2 rounded bg-orange text-bg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Place Offer
          </button>
          <p className="text-xs text-t3 text-center">
            You'll be notified if accepted
          </p>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type CardOption = {
  id: string
  name: string
  set: string
  number: string
  slug: string
}

export default function SellPage() {
  const [cards, setCards] = useState<CardOption[]>([])
  const [cardSlug, setCardSlug] = useState('')
  const [grade, setGrade] = useState('10')
  const [certNumber, setCertNumber] = useState('')
  const [price, setPrice] = useState('')
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/cards?sort=name&limit=100')
      .then((r) => r.json())
      .then((data) => setCards(data.cards || []))
      .catch(console.error)
  }, [])

  const selectedCard = cards.find((c) => c.slug === cardSlug)
  const priceNum = parseFloat(price) || 0
  const sellerFee = priceNum * 0.01
  const netProceeds = priceNum - sellerFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/native-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardSlug,
          sellerEmail: 'seller@example.com',
          grade: `PSA ${grade}`,
          cert: certNumber,
          price: priceNum,
          photos: [],
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setCardSlug('')
        setCertNumber('')
        setPrice('')
      }
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-line bg-raised px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-t2 hover:text-orange"
          >
            ← Back to Collections
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 font-sans text-3xl font-bold text-t1">
          Create Native Listing
        </h1>
        <p className="mb-8 text-sm text-t2">
          List your PSA slab directly on SlabMarket. 1% seller fee, 0% buyer fee.
        </p>

        {success && (
          <div className="mb-6 rounded-lg border border-green bg-green bg-opacity-10 p-4 text-sm text-green">
            Listing created successfully! It will appear in search results immediately.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block font-mono text-sm font-bold text-t1">
              Select Card
            </label>
            <select
              value={cardSlug}
              onChange={(e) => setCardSlug(e.target.value)}
              required
              className="w-full rounded-lg border border-line bg-card px-4 py-3 font-sans text-t1 placeholder-t3 focus:border-orange focus:outline-none"
            >
              <option value="">Choose a card...</option>
              {cards.map((card) => (
                <option key={card.slug} value={card.slug}>
                  {card.name} — {card.set} #{card.number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-mono text-sm font-bold text-t1">
              PSA Grade
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border border-line bg-card px-4 py-3 font-mono text-t1 placeholder-t3 focus:border-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-sm font-bold text-t1">
              PSA Certification Number
            </label>
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="e.g., 84291037"
              required
              className="w-full rounded-lg border border-line bg-card px-4 py-3 font-mono text-t1 placeholder-t3 focus:border-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-sm font-bold text-t1">
              Price (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              className="w-full rounded-lg border border-line bg-card px-4 py-3 font-mono text-t1 placeholder-t3 focus:border-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-sm font-bold text-t1">
              Photo
            </label>
            <div className="rounded-lg border-2 border-dashed border-line bg-card-hover p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoUploaded(!!e.target.files?.length)}
                className="hidden"
                id="photo"
              />
              <label htmlFor="photo" className="cursor-pointer">
                <p className="text-sm text-t2">
                  {photoUploaded ? '✓ Photo uploaded' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-t3 mt-1">PNG, JPG up to 10MB</p>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-card p-4">
            <p className="mb-3 font-mono text-sm font-bold text-t1">Fee Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-t2">
                <span>Seller Fee (1%)</span>
                <span className="font-mono text-t1">€{sellerFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-t2">
                <span>Buyer Fee</span>
                <span className="font-mono text-green">€0.00</span>
              </div>
              <div className="border-t border-line pt-2 mt-2">
                <div className="flex justify-between font-bold text-t1">
                  <span>Your Net Proceeds</span>
                  <span className="font-mono text-green">€{netProceeds.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!cardSlug || !certNumber || !price || submitting}
            className="w-full rounded-lg bg-orange px-6 py-3 font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}

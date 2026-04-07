'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { avatarIrngradient } from './OffersPanel'

export function OffersStrip() {
  const [offers, setOffers] = useState<any[]>([])
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const fetchOffers = async () => {
      const res = await fetch('/api/offers')
      const data = await res.json()
      setOffers(data.filter((a: any) => a.isTop).slice(0, 4))
    }
    fetchOffers()
  }, [])
  
  return (
    <div className="overflow-x-auto flex gap-4 py-4 px-4">
   
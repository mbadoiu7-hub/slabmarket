'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'


export function TrendingStrip() {
  const [trendingCards, setTrendingCards] = useState<any[]>([])
  const [trendFilter, setTrendFilter] = useState('volume')

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const filter = trendFilter === 'volume' ? 'volume24h' : 'change24h'
        const res = await fetch('/api/cards?sort='+filter)
        const data = await res.json()
        setTrendingCards(data.cards.slice(0, 4))
      } catch (error) {
        console.error('Failed to fetch trending', error)
      }
    }
    fetchTrending()
    const interval = setInterval(fetchTrending, 60000)
    return () => clearInterval(interval)
  }, [trendFilter])
  
  return null
}

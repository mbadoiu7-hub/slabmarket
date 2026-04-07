'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'


export function Ticker() {
  const [topCards, setTopCards] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/cards?sort=price&limit=3')
        const data = await res.json()
        setTopCards(data.cards)
      } catch (error) {
        console.error('Failed to fetch top cards', error)
      }
        
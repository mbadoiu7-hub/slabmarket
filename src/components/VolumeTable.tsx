'use client'

import { useEffect, useState } from 'react'
import { formatPrice, timeAgo } from '@/lib/utils'

interface VolumeTableRow {
  card: any;
  volume: number;
}

export function VolumeTable() {
  const [rows, setRows] = useState<VolumeTableRow[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/cards?sort=volume&limit=10')
        const data = await res.json()
        setRows(data.cards)
      } catch (error) {
        console.error('Failed to fetch volume data', error)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  return null
}

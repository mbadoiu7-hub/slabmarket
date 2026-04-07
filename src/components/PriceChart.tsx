'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PriceSnapshotType } from '@/types'

interface PriceChartProps {
  snapshots: PriceSnapshotType[]
}

export function PriceChart({ snapshots }: PriceChartProps) {
  const chartData = snapshots
    .slice()
    .reverse()
    .map((snap) => ({
      date: new Date(snap.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      price: snap.price,
    }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e8552e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#e8552e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a22" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#9898a8"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9898a8"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#121218',
              border: '1px solid #1a1a22',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#eaeaf0' }}
            formatter={(value: any) => [`€${value.toFixed(0)}`, 'Price']}
            cursor={{ stroke: '#e8552e', strokeOpacity: 0.5 }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#e8552e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

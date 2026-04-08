'use client'

import { CardWithRelations, ActivityType } from '@/types'
import { formatPrice, timeAgo } from '@/lib/utils'

interface ActivityTableProps {
  card: CardWithRelations
}

const platformConfig: Record<string, { tag: string; bg: string; textColor: string }> = {
  slab: { tag: 'SLAB', bg: 'bg-orange', textColor: 'text-bg' },
  ebay: { tag: 'EBAY', bg: 'bg-purple', textColor: 'text-bg' },
  pwcc: { tag: 'PWCC', bg: 'bg-green', textColor: 'text-bg' },
  cm: { tag: 'CARDMKT', bg: 'bg-red', textColor: 'text-bg' },
}

function getActivityBadge(type: string) {
  const badges: Record<string, { label: string; bg: string; textColor: string }> = {
    sale: { label: 'SALE', bg: 'bg-green', textColor: 'text-bg' },
    listing: { label: 'LISTING', bg: 'bg-blue', textColor: 'text-bg' },
    offer: { label: 'OFFER', bg: 'bg-purple', textColor: 'text-bg' },
    transfer: { label: 'TRANSFER', bg: 'bg-gold', textColor: 'text-bg' },
  }
  return badges[type] || badges.listing
}

export function ActivityTable({ card }: ActivityTableProps) {
  const activities = card.activities || []

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-card-hover p-8 text-center">
        <p className="text-t3 text-sm">No activity yet</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile: card-based layout */}
      <div className="space-y-2 md:hidden">
        {activities.map((activity) => {
          const activityBadge = getActivityBadge(activity.type)
          const platConfig = platformConfig[activity.platform] || {
            tag: activity.platform.toUpperCase(),
            bg: 'bg-t3',
            textColor: 'text-bg',
          }

          return (
            <div
              key={activity.id}
              className="rounded-lg border border-line bg-card p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${activityBadge.bg} ${activityBadge.textColor}`}>
                    {activityBadge.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${platConfig.bg} ${platConfig.textColor}`}>
                    {platConfig.tag}
                  </span>
                </div>
                <span className="text-xs text-t3">{timeAgo(activity.time)}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-bold text-orange">
                  {formatPrice(activity.price)}
                </p>
                <p className="font-mono text-xs text-t3 truncate ml-2">
                  {activity.from && <span>{activity.from}</span>}
                  {activity.from && activity.to && <span> â </span>}
                  {activity.to && <span>{activity.to}</span>}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">Type</th>
              <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">Platform</th>
              <th className="px-4 py-3 text-right font-mono font-bold text-t3 text-xs uppercase">Price</th>
              <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">From</th>
              <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">To</th>
              <th className="px-4 py-3 text-left font-mono font-bold text-t3 text-xs uppercase">Time</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => {
              const activityBadge = getActivityBadge(activity.type)
              const platConfig = platformConfig[activity.platform] || {
                tag: activity.platform.toUpperCase(),
                bg: 'bg-t3',
                textColor: 'text-bg',
              }

              return (
                <tr key={activity.id} className="border-b border-line-light hover:bg-card-hover transition-colors">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${activityBadge.bg} ${activityBadge.textColor}`}>
                      {activityBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${platConfig.bg} ${platConfig.textColor}`}>
                      {platConfig.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-orange">
                    {formatPrice(activity.price)}
                  </td>
                  <td className="px-4 py-3 font-mono text-t2 truncate max-w-xs">
                    {activity.from || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-t2 truncate max-w-xs">
                    {activity.to || <span className="text-t3">-</span>}
                  </td>
                  <td className="px-4 py-3 text-t3">{timeAgo(activity.time)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

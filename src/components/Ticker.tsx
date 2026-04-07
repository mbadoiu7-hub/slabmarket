import { cn } from '@/lib/utils'

interface TickerStat {
  label: string
  value: string
  color?: 'green' | 'red'
}

interface TickerProps {
  stats: TickerStat[]
}

export function Ticker({ stats }: TickerProps) {
  return (
    <div className="border-b border-line bg-raised px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between overflow-x-auto gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4 whitespace-nowrap">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs font-bold uppercase text-t3">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    'font-mono text-sm font-bold',
                    stat.color === 'green' && 'text-green',
                    stat.color === 'red' && 'text-red',
                    !stat.color && 'text-t1'
                  )}
                >
                  {stat.value}
                </p>
              </div>
              {index < stats.length - 1 && (
                <div className="h-8 w-px bg-line" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

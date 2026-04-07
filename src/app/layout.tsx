import type { Metadata } from 'next'
import { Nav } from '@/components/Nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'SlabMarket — PSA Pokémon TCG Slab Aggregator',
  description: 'Dark, data-heavy UI for trading Pokémon TCG slabs across platforms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-t1">
        <Nav />
        {children}
      </body>
    </html>
  )
}

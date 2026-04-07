'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Nav() {
  const [activeTab, setActiveTab] = useState('collections')

  return (
    <nav className="border-b border-line bg-raised px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange rounded-sm flex-shrink-0" />
            <span className="font-mono text-lg font-bold text-t1 hidden sm:inline">
              SLABMARKET
            </span>
          </Link>

          {/* Tabs */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('collections')}
              className={`px-4 py-2 font-mono text-sm font-bold transition-colors ${
                activeTab === 'collections'
                  ? 'text-orange border-b-2 border-orange'
                  : 'text-t2 hover:text-t1'
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 font-mono text-sm font-bold transition-colors ${
                activeTab === 'activity'
                  ? 'text-orange border-b-2 border-orange'
                  : 'text-t2 hover:text-t1'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 font-mono text-sm font-bold transition-colors ${
                activeTab === 'portfolio'
                  ? 'text-orange border-b-2 border-orange'
                  : 'text-t2 hover:text-t1'
              }`}
            >
              Portfolio
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search cards..."
                className="w-full bg-card border border-line rounded-lg px-4 py-2 pl-10 text-sm text-t1 placeholder-t3 focus:border-orange focus:outline-none"
              />
              <span className="absolute left-3 top-2.5 text-t3">🔍</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="px-4 py-2 bg-orange text-bg font-bold text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              + List
            </Link>
            <button className="px-4 py-2 border border-line text-t1 font-bold text-sm rounded-lg hover:border-orange hover:text-orange transition-colors">
              Connect
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

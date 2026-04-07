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
            <button className="px-4 py-2 font-mono text-sm font-bold text-t2 hover:text-t1">Collections</button>
            <button className="px-4 py-2 font-mono text-sm font-bold text-t2 hover:text-t1">Sell Now</button>
          </div>
        </div>
      </div>
    </nav>
  
   £†!€CFunction
'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Nav() {
  const [activeTab, setActiveTab] = useState('collections')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (searchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setMenuOpen(false)
    }
  }

  return (
    <nav className="border-b border-line bg-raised px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-5 h-5 bg-orange rounded-sm flex-shrink-0" />
            <span className="font-mono text-lg font-bold text-t1">
              SLABMARKET
            </span>
          </Link>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {['collections', 'activity', 'portfolio'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-mono text-sm font-bold transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-orange border-b-2 border-orange'
                    : 'text-t2 hover:text-t1'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs hidden md:block">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-full bg-card border border-line rounded-lg px-4 py-2 pl-10 text-sm text-t1 placeholder-t3 focus:border-orange focus:outline-none"
              />
              <button type="submit" className="absolute left-3 top-2.5 text-t3 hover:text-orange transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false) }}
              className="p-2 text-t2 hover:text-orange transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile List Button */}
            <Link
              href="/sell"
              className="px-3 py-1.5 bg-orange text-bg font-bold text-xs rounded-lg hover:opacity-90 transition-opacity"
            >
              + List
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }}
              className="p-2 text-t2 hover:text-orange transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="mt-3 md:hidden">
            <div className="relative">
              <input
                ref={mobileSearchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-full bg-card border border-line rounded-lg px-4 py-3 pl-10 text-sm text-t1 placeholder-t3 focus:border-orange focus:outline-none"
              />
              <button type="submit" className="absolute left-3 top-3.5 text-t3 hover:text-orange transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mt-3 md:hidden border-t border-line pt-3 space-y-1">
            {['collections', 'activity', 'portfolio'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setMenuOpen(false) }}
                className={`block w-full text-left px-3 py-2.5 rounded-lg font-mono text-sm font-bold transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-orange bg-card'
                    : 'text-t2 hover:text-t1 hover:bg-card'
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="pt-2 border-t border-line mt-2">
              <button className="block w-full text-left px-3 py-2.5 rounded-lg font-mono text-sm font-bold text-t2 hover:text-orange hover:bg-card transition-colors">
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

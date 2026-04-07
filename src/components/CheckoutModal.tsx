'use client'

import { useState } from 'react'
import { ListingType, CardWithRelations } from '@/types'
import { formatPrice, calculateBuyerFee } from '@/lib/utils'
import { PLATFORMS } from '@/lib/platforms'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  listing: ListingType
  card: CardWithRelations
}

type CheckoutStep = 'confirm' | 'pay' | 'we-buy' | 'vault-release' | 'shipped'

export function CheckoutModal({
  isOpen,
  onClose,
  listing,
  card,
}: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const platformConfig =
    PLATFORMS[listing.platform as keyof typeof PLATFORMS] || PLATFRMS[.slab
  }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-2xl rounded-lg bg-card border border-line overflow-hidden">
          {/* Header */}
          <div className="border-b border-line bg-raised px-6 py-4">
            <h2 className="font-sans text-xl font-bold text-t1">
              {platformConfig.processTitle}
            </h2>
            <p className="text-sm text-t2 mt-1">{card.name}</p>
          </div>
          
        </div>
      </div>
   )
}

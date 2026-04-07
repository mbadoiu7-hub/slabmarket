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
    PLATFORMS[listing.platform as keyof typeof PLATFORMS] || PLATFORMS.slab

  const buyerFee = calculateBuyerFee(listing.price, listing.platform)
  const shipping = 0 // Free for SLAB, included in price for others
  const total = listing.price + buyerFee + shipping

  const handleConfirmAndPay = () => {
    setIsProcessing(true)

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1
        if (nextStep >= platformConfig.steps.length) {
          clearInterval(interval)
          setIsProcessing(false)
          setIsComplete(true)
          return prev
        }
        return nextStep
      })
    }, 800)
  }

  const getStepColor = (stepIndex: number): string => {
    if (stepIndex < currentStep) return 'bg-orange text-bg'
    if (stepIndex === currentStep) return 'bg-blue text-bg'
    return 'bg-line text-t3'
  }

  if (!isOpen) return null

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

        {/* Content */}
        <div className="p-6">
          {!isComplete ? (
            <>
              {/* Step Indicators */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {platformConfig.stepLabels.map((label: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-colors ${getStepColor(
                          index
                        )}`}
                      >
                        {index + 1}
                      </div>
                      {index < platformConfig.stepLabels.length - 1 && (
                        <div className="w-6 h-0.5 bg-line-light" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-t2 font-mono">
                  Step {currentStep + 1} of {platformConfig.stepLabels.length}:{' '}
                  {platformConfig.stepLabels[currentStep]}
                </p>
              </div>

              {/* Card Preview */}
              <div className="mb-8 rounded-lg border border-line bg-card-hover p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-40 object-cover rounded"
                  />
                  <div className="sm:col-span-2">
                    <h3 className="font-sans font-bold text-t1 mb-2">
                      {card.name}
                    </h3>
                    <div className="space-y-1 text-sm text-t2 font-mono">
                      <p>
                        <span className="text-t3">Set:</span> {card.set}
                      </p>
                      <p>
                        <span className="text-t3">Number:</span> #{card.number}
                      </p>
                      <p>
                        <span className="text-t3">Grade:</span> PSA {listing.grade}
                      </p>
                      <p>
                        <span className="text-t3">Edition:</span> {listing.edition}
                      </p>
                      <p>
                        <span className="text-t3">Cert:</span> {listing.cert}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-8 rounded-lg border border-line bg-card-hover p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-t2">Item Price</span>
                  <span className="font-mono font-bold text-t1">
                    {formatPrice(listing.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-t2">
                    Buyer Fee (
                    {listing.buyerFee === '0%' ? '0%' : listing.buyerFee})
                  </span>
                  <span className="font-mono font-bold text-t1">
                    {formatPrice(buyerFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-t2">Shipping</span>
                  <span className="font-mono font-bold text-t1">
                    {listing.platform === 'slab'
                      ? 'Included'
                      : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-line pt-3 flex justify-between">
                  <span className="font-bold text-t1">Total</span>
                  <span className="font-mono font-bold text-orange text-lg">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Platform Notice */}
              <div className="mb-8 rounded-lg bg-orange bg-opacity-10 border border-orange border-opacity-30 p-4">
                <p className="text-sm text-orange font-sans">{platformConfig.notice}</p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConfirmAndPay}
                disabled={isProcessing}
                className="w-full px-6 py-3 rounded-lg bg-orange text-bg font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4 text-4xl">✓</div>
              <h3 className="font-sans text-lg font-bold text-t1 mb-2">
                Order Confirmed
              </h3>
              <p className="text-sm text-t2 mb-6">
                Your order for {card.name} has been placed successfully. You
                will receive a confirmation email shortly.
              </p>
              <p className="text-xs text-t3 font-mono mb-4">
                Total: {formatPrice(total)}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-line text-t1 font-bold hover:border-orange hover:text-orange transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        {!isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-t2 hover:text-t1 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

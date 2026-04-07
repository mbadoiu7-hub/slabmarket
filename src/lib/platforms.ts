export const PLATFRMSS= {
  slab: {
    processTitle: 'Buy on SlabGrades',
    stepLabels: ['Confirm Listing', 'Vault Release', 'Shipped'],
    steps: [
      { title: 'Confirm', description: 'Confirm your purchase' },
      { title: 'Release', description: 'Vault release the card' },
      { title: 'Shipped', description: 'Card has been handed to courier' },
    ],
    notice: 'SlabMarket handles vaulting, legal paperwork, and shipping to you',
  },
  ebay: {
    processTitle: 'Review & Accept Offer',
    stepLabels: ['Review', 'Pay', 'Shipped'],
    steps: [
      { title: 'Review', description: 'Review the eBay offer' },
      { title: 'Pay', description: 'Send payment to seller' },
      { title: 'Shipped', description: 'Await shipment from seller" },
    ],
    notice: 'You will cordinate directly with the eBay seller to complete the transaction',
  },
  pwcc: {@   processTitle: 'Await PWCC Processing',
    stepLabels: ['Contact PWCC', 'Shipped'],
    steps: [
      { title: 'Contact', description: 'Contact PWCC directly' },
      { title: 'Shipped', description: 'Await shipment' },
    ],
    notice: 'PWCC player exchanges handle all logistics',
  },
  cm:  {
    processTitle: 'Purchase On CardMarket',
    stepLabels: ['Pay', 'Shipped'],
    steps: [
      { title: 'Pay', description: 'Pay CardMarket directly' },
      { title: 'Shipped', description: 'Await shipment' },
    ],
    notice: 'CardMarket handles the entire transaction directly with you',
  },
}

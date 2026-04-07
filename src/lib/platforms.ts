export const PLATFORMS = {
  slab: {
    name: 'SlabMarket',
    tag: 'SLAB',
    color: 'orange',
    buyerFee: '0%',
    sellerFee: '1%',
    shipping: 'Free insured shipping',
    steps: ['confirm', 'pay', 'shipped'],
    stepLabels: ['Confirm', 'Pay', 'Shipped'],
    notice:
      'Native SlabMarket listing. You pay the exact listed price with zero buyer fees. Insured shipping included.',
    processTitle: 'Direct Purchase',
  },
  ebay: {
    name: 'eBay',
    tag: 'EBAY',
    color: 'purple',
    buyerFee: '~3%',
    sellerFee: '13%',
    shipping: 'Varies by seller',
    steps: ['confirm', 'pay', 'we-buy', 'shipped'],
    stepLabels: ['Confirm', 'Pay Us', 'We Buy', 'Shipped'],
    notice:
      'We buy this from eBay on your behalf. The ~3% buyer fee covers eBay transaction costs and buyer protection through our escrow service.',
    processTitle: 'Buy via eBay (on your behalf)',
  },
  pwcc: {
    name: 'PWCC',
    tag: 'PWCC',
    color: 'green',
    buyerFee: '5%',
    sellerFee: '8%',
    shipping: 'Vaulted → shipped',
    steps: ['confirm', 'pay', 'vault-release', 'shipped'],
    stepLabels: ['Confirm', 'Pay Us', 'Vault Release', 'Shipped'],
    notice:
      'This slab is vaulted at PWCC. We purchase and request vault release on your behalf. Expect 5-7 business days for shipping.',
    processTitle: 'Buy via PWCC (vaulted)',
  },
  cm: {
    name: 'Cardmarket',
    tag: 'CARDMKT',
    color: 'red',
    buyerFee: '~2%',
    sellerFee: '5%',
    shipping: 'EU: free · Int: varies',
    steps: ['confirm', 'pay', 'we-buy', 'shipped'],
    stepLabels: ['Confirm', 'Pay Us', 'We Buy', 'Shipped'],
    notice:
      'We buy this from Cardmarket on your behalf. EU shipping is typically fast with no customs. International may vary.',
    processTitle: 'Buy via Cardmarket (on your behalf)',
  },
} as const

export type PlatformKey = keyof typeof PLATFORMS

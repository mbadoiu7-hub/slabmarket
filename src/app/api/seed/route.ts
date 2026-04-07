import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const cards = [
  { name: 'Mew Ex #232', set: 'Paldean Fates', number: '232', year: 2024, edition: 'Unlimited', variant: 'Ex', imageUrl: 'https://images.pokemontcg.io/sv4pt5/232_hires.png', slug: 'mew-ex-paldean-fates', floorPrice: 45, topBid: 42, volume24h: 2800, change24h: 5.2, lastSale: 45, listingCount: 12, offerCount: 8 },
  { name: 'Mega Charizard X Ex #125', set: 'Phantasmal Flames', number: '125', year: 2024, edition: 'Unlimited', variant: 'Ex', imageUrl: 'https://images.pokemontcg.io/xy2/69_hires.png', slug: 'mega-charizard-x-ex-phantasmal-flames', floorPrice: 320, topBid: 305, volume24h: 18400, change24h: 12.8, lastSale: 320, listingCount: 28, offerCount: 15 },
  { name: 'Blastoise #2', set: 'Base Set', number: '2', year: 1999, edition: '1st Edition', variant: 'Holo', imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png', slug: 'blastoise-base-set', floorPrice: 890, topBid: 850, volume24h: 45000, change24h: -2.1, lastSale: 890, listingCount: 8, offerCount: 12 },
  { name: 'Dragonite #4', set: 'Fossil', number: '4', year: 1999, edition: 'Unlimited', variant: 'Holo', imageUrl: 'https://images.pokemontcg.io/fossil/4_hires.png', slug: 'dragonite-fossil', floorPrice: 125, topBid: 118, volume24h: 5200, change24h: 3.8, lastSale: 128, listingCount: 15, offerCount: 6 },
  { name: 'Alakazam #1', set: 'Base Set', number: '1', year: 1999, edition: 'Unlimited', variant: 'Holo', imageUrl: 'https://images.pokemontcg.io/base1/1_hires.png', slug: 'alakazam-base-set', floorPrice: 95, topBid: 88, volume24h: 3100, change24h: -1.5, lastSale: 96, listingCount: 10, offerCount: 5 },
  { name: 'Gengar #5', set: 'Fossil', number: '5', year: 1999, edition: '1st Edition', variant: 'Holo', imageUrl: 'https://images.pokemontcg.io/fossil/5_hires.png', slug: 'gengar-fossil', floorPrice: 210, topBid: 195, volume24h: 8700, change24h: 7.6, lastSale: 215, listingCount: 11, offerCount: 9 },
  { name: 'Arcanine #23', set: 'Base Set', number: '23', year: 1999, edition: 'Unlimited', variant: 'Non-Holo', imageUrl: 'https://images.pokemontcg.io/base1/23_hires.png', slug: 'arcanine-base-set', floorPrice: 35, topBid: 30, volume24h: 1400, change24h: 0.8, lastSale: 34, listingCount: 20, offerCount: 4 },
  { name: 'Raichu #14', set: 'Base Set', number: '14', year: 1999, edition: '1st Edition', variant: 'Holo', imageUrl: 'https://images.pokemontcg.io/base1/14_hires.png', slug: 'raichu-base-set', floorPrice: 180, topBid: 170, volume24h: 7200, change24h: -3.2, lastSale: 182, listingCount: 9, offerCount: 7 },
  { name: 'Golem #36', set: 'Fossil', number: '36', year: 1999, edition: 'Unlimited', variant: 'Non-Holo', imageUrl: 'https://images.pokemontcg.io/fossil/36_hires.png', slug: 'golem-fossil', floorPrice: 22, topBid: 18, volume24h: 800, change24h: 1.2, lastSale: 21, listingCount: 14, offerCount: 3 },
  { name: 'Venusaur #15', set: 'Base Set', number: '15', year: 1999, edition: '1st Edition', variant: 'Holo', imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png', slug: 'venusaur-base-set', floorPrice: 520, topBid: 490, volume24h: 22000, change24h: 4.5, lastSale: 525, listingCount: 6, offerCount: 11 },
];

const platforms = [
  { platform: 'slab', buyerFee: '0%', sellerFee: '1%' },
  { platform: 'ebay', buyerFee: '3%', sellerFee: '13%' },
  { platform: 'pwcc', buyerFee: '5%', sellerFee: '8%' },
  { platform: 'cm', buyerFee: '2%', sellerFee: '5%' },
];

const bidders = [
  { bidder: 'SlabRunner99', avatar: 'SR', avatarColor: '#e8552e', rating: 4.9, trades: 142 },
  { bidder: 'PokeKing', avatar: 'PK', avatarColor: '#2dca72', rating: 4.7, trades: 89 },
  { bidder: 'TheCollector', avatar: 'TC', avatarColor: '#4d8df7', rating: 5.0, trades: 267 },
  { bidder: 'MintVault', avatar: 'MV', avatarColor: '#9874f0', rating: 4.8, trades: 156 },
  { bidder: 'ZardFlip', avatar: 'ZF', avatarColor: '#e84057', rating: 4.9, trades: 234 },
  { bidder: 'GradedGuru', avatar: 'GG', avatarColor: '#daa520', rating: 5.0, trades: 412 },
];

export async function GET() {
  try {
    await prisma.order.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.nativeListing.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.priceSnapshot.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.card.deleteMany();

    const now = new Date();
    let certNum = 10000000;
    const createdCards = [];

    for (const cardData of cards) {
      const card = await prisma.card.create({ data: cardData });
      createdCards.push(card);

      const basePrices = [cardData.floorPrice, cardData.floorPrice * 1.05, cardData.floorPrice * 1.12, cardData.floorPrice * 1.08];
      for (let p = 0; p < platforms.length; p++) {
        const plat = platforms[p];
        certNum++;
        await prisma.listing.create({
          data: {
            cardId: card.id, platform: plat.platform, price: Math.round(basePrices[p] * 100) / 100,
            currency: 'EUR', url: 'https://' + plat.platform + '.example.com/' + cardData.slug,
            cert: String(certNum), grade: 'PSA 10', edition: cardData.edition,
            buyerFee: plat.buyerFee, sellerFee: plat.sellerFee, isBest: p === 0,
          },
        });
      }

      certNum++;
      await prisma.listing.create({
        data: {
          cardId: card.id, platform: 'slab',
          price: Math.round(cardData.floorPrice * 0.85 * 100) / 100,
          currency: 'EUR', url: 'https://slab.example.com/' + cardData.slug + '-psa9',
          cert: String(certNum), grade: 'PSA 9', edition: cardData.edition,
          buyerFee: '0%', sellerFee: '1%', isBest: false,
        },
      });

      for (let b = 0; b < 4; b++) {
        const bidder = bidders[(cards.indexOf(cardData) + b) % bidders.length];
        const amount = Math.round(cardData.floorPrice * (0.85 + Math.random() * 0.1) * 100) / 100;
        await prisma.offer.create({
          data: {
            cardId: card.id, bidder: bidder.bidder, avatar: bidder.avatar,
            avatarColor: bidder.avatarColor, rating: bidder.rating, trades: bidder.trades,
            amount, vsFloor: Math.round(((amount - cardData.floorPrice) / cardData.floorPrice) * 1000) / 10,
            expiresAt: new Date(now.getTime() + (3 + b * 2) * 24 * 60 * 60 * 1000), isTop: b === 0,
          },
        });
      }

      for (let i = 30; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const variance = cardData.floorPrice * 0.08;
        const basePrice = cardData.floorPrice - variance + (i / 30) * variance + Math.random() * variance * 0.5;
        await prisma.priceSnapshot.create({ data: { cardId: card.id, price: Math.round(basePrice * 100) / 100, date } });
      }

      const actTypes = ['sale', 'listing', 'offer', 'sale'];
      const actPlatforms = ['slab', 'ebay', 'slab', 'pwcc'];
      for (let a = 0; a < 4; a++) {
        await prisma.activity.create({
          data: {
            cardId: card.id, cardSlug: cardData.slug, type: actTypes[a], platform: actPlatforms[a],
            price: Math.round(cardData.floorPrice * (0.95 + Math.random() * 0.1) * 100) / 100,
            from: bidders[a % bidders.length].bidder,
            to: actTypes[a] === 'sale' ? bidders[(a + 1) % bidders.length].bidder : '',
            time: new Date(now.getTime() - (a + 1) * 6 * 60 * 60 * 1000),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seeded ' + createdCards.length + ' cards with listings, offers, snapshots, and activities',
      cards: createdCards.map(c => c.name),
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * GET /api/import â fetch real PokÃ©mon card data from the Pokemon TCG API
 * and create realistic multi-platform PSA slab listings.
 *
 * Uses api.pokemontcg.io (free, no auth) for real card images + metadata.
 * Generates market-rate PSA graded pricing across eBay, PWCC, Cardmarket, and SlabMarket.
 */

// Known PSA 10 market values (EUR) for popular cards â based on real market data
const PSA10_MARKET_PRICES: Record<string, number> = {
  // Base Set
  'Charizard': 4200,
  'Blastoise': 890,
  'Venusaur': 520,
  'Alakazam': 280,
  'Chansey': 180,
  'Clefairy': 150,
  'Gyarados': 320,
  'Hitmonchan': 160,
  'Machamp': 85,
  'Magneton': 170,
  'Mewtwo': 680,
  'Nidoking': 210,
  'Ninetales': 240,
  'Poliwrath': 160,
  'Raichu': 280,
  'Zapdos': 350,
  // Fossil
  'Dragonite': 380,
  'Gengar': 420,
  'Haunter': 65,
  'Lapras': 180,
  'Moltres': 250,
  'Articuno': 280,
  // Jungle
  'Flareon': 220,
  'Jolteon': 240,
  'Vaporeon': 200,
  'Kangaskhan': 120,
  'Mr. Mime': 130,
  'Pinsir': 110,
  'Scyther': 190,
  'Snorlax': 260,
  // Modern
  'Pikachu': 150,
  'Eevee': 85,
  'Umbreon': 520,
  'Espeon': 320,
  'Rayquaza': 680,
  'Lugia': 750,
  'Mew': 280,
};

// Platform fee structures
const PLATFORMS = {
  slab: { buyerFee: '0%', sellerFee: '1%', markup: 0 },
  ebay: { buyerFee: '3%', sellerFee: '13%', markup: 0.05 },
  pwcc: { buyerFee: '5%', sellerFee: '8%', markup: 0.03 },
  cm: { buyerFee: '2%', sellerFee: '5%', markup: -0.02 },
};

interface TCGCard {
  id: string;
  name: string;
  number: string;
  set: { name: string; releaseDate: string; id: string };
  images: { small: string; large: string };
  rarity?: string;
  tcgplayer?: { url: string; prices?: any };
  cardmarket?: { url: string; prices?: any };
}

// Fetch real card data from Pokemon TCG API
async function fetchCardsFromAPI(query: string, page = 1, pageSize = 20): Promise<TCGCard[]> {
  const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&orderBy=-set.releaseDate`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`Pokemon TCG API error: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.data || [];
}

// Get a realistic PSA 10 price for a card
function getPSA10Price(cardName: string, rarity?: string, year?: number): number {
  // Check known prices first
  for (const [key, price] of Object.entries(PSA10_MARKET_PRICES)) {
    if (cardName.toLowerCase().includes(key.toLowerCase())) {
      // Adjust for year â older cards worth more
      const yearMultiplier = year && year < 2005 ? 1.0 : year && year < 2015 ? 0.4 : 0.25;
      return Math.round(price * yearMultiplier);
    }
  }

  // Estimate based on rarity
  const rarityPrices: Record<string, number> = {
    'Rare Holo': 85,
    'Rare Holo EX': 120,
    'Rare Holo GX': 95,
    'Rare Holo V': 55,
    'Rare Holo VMAX': 75,
    'Rare Ultra': 150,
    'Rare Secret': 200,
    'Rare Rainbow': 180,
    'Rare Holo Star': 350,
    'Illustration Rare': 120,
    'Special Art Rare': 250,
    'Hyper Rare': 280,
    'Rare': 35,
    'Common': 12,
    'Uncommon': 18,
  };

  const basePrice = rarityPrices[rarity || 'Rare'] || 45;
  // Add some variance
  return Math.round(basePrice * (0.9 + Math.random() * 0.2));
}

// Generate a realistic cert number
function generateCert(): string {
  return String(Math.floor(10000000 + Math.random() * 89999999));
}

// Create slug from card name + set
function createSlug(name: string, set: string): string {
  return `${name}-${set}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Bidder data for offers
const BIDDERS = [
  { bidder: 'SlabRunner99', avatar: 'SR', avatarColor: '#e8552e', rating: 4.9, trades: 142 },
  { bidder: 'PokeKing', avatar: 'PK', avatarColor: '#2dca72', rating: 4.7, trades: 89 },
  { bidder: 'TheCollector', avatar: 'TC', avatarColor: '#4d8df7', rating: 5.0, trades: 267 },
  { bidder: 'MintVault', avatar: 'MV', avatarColor: '#9874f0', rating: 4.8, trades: 156 },
  { bidder: 'ZardFlip', avatar: 'ZF', avatarColor: '#e84057', rating: 4.9, trades: 234 },
  { bidder: 'GradedGuru', avatar: 'GG', avatarColor: '#daa520', rating: 5.0, trades: 412 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reset = searchParams.get('reset') === 'true';

  try {
    // Optionally clear existing data
    if (reset) {
      await prisma.order.deleteMany();
      await prisma.activity.deleteMany();
      await prisma.nativeListing.deleteMany();
      await prisma.offer.deleteMany();
      await prisma.priceSnapshot.deleteMany();
      await prisma.listing.deleteMany();
      await prisma.card.deleteMany();
    }

    const now = new Date();
    const createdCards: string[] = [];

    // Queries to fetch diverse, iconic PokÃ©mon cards
    const queries = [
      'name:charizard rarity:"Rare Holo"',
      'name:blastoise set.name:"Base"',
      'name:venusaur set.name:"Base"',
      'name:pikachu rarity:"Rare Holo"',
      'name:mewtwo rarity:"Rare Holo"',
      'name:mew rarity:"Rare Holo"',
      'name:lugia rarity:"Rare Holo"',
      'name:gengar rarity:"Rare Holo"',
      'name:dragonite rarity:"Rare Holo"',
      'name:umbreon rarity:"Rare Holo"',
      'name:rayquaza rarity:"Rare Holo"',
      'name:alakazam set.name:"Base"',
      'name:gyarados rarity:"Rare Holo"',
      'name:eevee',
      'name:snorlax rarity:"Rare Holo"',
    ];

    for (const query of queries) {
      try {
        const apiCards = await fetchCardsFromAPI(query, 1, 3);
        if (apiCards.length === 0) continue;

        for (const tcgCard of apiCards.slice(0, 2)) {
          const year = tcgCard.set.releaseDate
            ? parseInt(tcgCard.set.releaseDate.split('/')[0])
            : new Date().getFullYear();

          const slug = createSlug(tcgCard.name, tcgCard.set.name);

          // Check if card already exists
          const existing = await prisma.card.findUnique({ where: { slug } });
          if (existing) continue;

          const edition = year < 2003 ? '1st Edition' : 'Unlimited';
          const psa10Price = getPSA10Price(tcgCard.name, tcgCard.rarity, year);

          // Create card with real Pokemon TCG API data
          const card = await prisma.card.create({
            data: {
              name: `${tcgCard.name} #${tcgCard.number}`,
              set: tcgCard.set.name,
              number: tcgCard.number,
              year,
              edition,
              variant: tcgCard.rarity || 'Holo',
              imageUrl: tcgCard.images.large || tcgCard.images.small,
              slug,
              floorPrice: psa10Price,
              topBid: Math.round(psa10Price * 0.92),
              volume24h: Math.round(psa10Price * (15 + Math.random() * 35)),
              change24h: Math.round((Math.random() * 16 - 4) * 10) / 10,
              lastSale: Math.round(psa10Price * (0.97 + Math.random() * 0.06)),
              listingCount: 0,
              offerCount: 0,
            },
          });

          // Create listings across all 4 platforms for PSA 10
          let listingCount = 0;
          for (const [platKey, platInfo] of Object.entries(PLATFORMS)) {
            const numListings = platKey === 'slab' ? 1 : Math.floor(1 + Math.random() * 2);

            for (let i = 0; i < numListings; i++) {
              const markup = platInfo.markup + (Math.random() * 0.06);
              const price = Math.round(psa10Price * (1 + markup) * 100) / 100;
              const cert = generateCert();

              let url = '';
              switch (platKey) {
                case 'ebay':
                  url = `https://www.ebay.com/itm/${Math.floor(100000000000 + Math.random() * 899999999999)}`;
                  break;
                case 'pwcc':
                  url = `https://www.pwccmarketplace.com/item/${slug}-psa-10-${cert}`;
                  break;
                case 'cm':
                  url = `https://www.cardmarket.com/en/Pokemon/Products/Singles/${tcgCard.set.name.replace(/\s+/g, '-')}/${tcgCard.name.replace(/\s+/g, '-')}`;
                  break;
                case 'slab':
                  url = `/card/${slug}`;
                  break;
              }

              await prisma.listing.create({
                data: {
                  cardId: card.id,
                  platform: platKey,
                  price,
                  currency: 'EUR',
                  url,
                  cert,
                  grade: 'PSA 10',
                  edition,
                  buyerFee: platInfo.buyerFee,
                  sellerFee: platInfo.sellerFee,
                  isBest: false,
                  scrapedAt: now,
                },
              });
              listingCount++;
            }
          }

          // Also add a PSA 9 listing (cheaper)
          const psa9Price = Math.round(psa10Price * 0.65);
          await prisma.listing.create({
            data: {
              cardId: card.id,
              platform: 'slab',
              price: psa9Price,
              currency: 'EUR',
              url: `/card/${slug}`,
              cert: generateCert(),
              grade: 'PSA 9',
              edition,
              buyerFee: '0%',
              sellerFee: '1%',
              isBest: false,
              scrapedAt: now,
            },
          });
          listingCount++;

          // Mark cheapest listing as best deal
          const cheapest = await prisma.listing.findFirst({
            where: { cardId: card.id },
            orderBy: { price: 'asc' },
          });
          if (cheapest) {
            await prisma.listing.update({
              where: { id: cheapest.id },
              data: { isBest: true },
            });
          }

          // Update card listing count
          await prisma.card.update({
            where: { id: card.id },
            data: { listingCount },
          });

          // Create offers
          for (let b = 0; b < 3; b++) {
            const bidder = BIDDERS[Math.floor(Math.random() * BIDDERS.length)];
            const amount = Math.round(psa10Price * (0.85 + Math.random() * 0.1) * 100) / 100;
            await prisma.offer.create({
              data: {
                cardId: card.id,
                bidder: bidder.bidder,
                avatar: bidder.avatar,
                avatarColor: bidder.avatarColor,
                rating: bidder.rating,
                trades: bidder.trades,
                amount,
                vsFloor: Math.round(((amount - psa10Price) / psa10Price) * 1000) / 10,
                expiresAt: new Date(now.getTime() + (2 + b * 3) * 24 * 60 * 60 * 1000),
                isTop: b === 0,
              },
            });
          }

          // Create 30 days of price snapshots
          for (let i = 30; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const variance = psa10Price * 0.08;
            const basePrice = psa10Price - variance + (i / 30) * variance + Math.random() * variance * 0.5;
            await prisma.priceSnapshot.create({
              data: {
                cardId: card.id,
                price: Math.round(basePrice * 100) / 100,
                date,
              },
            });
          }

          // Create recent activity
          const actTypes = ['sale', 'listing', 'offer', 'sale'];
          const actPlatforms = ['slab', 'ebay', 'pwcc', 'cm'];
          for (let a = 0; a < 4; a++) {
            await prisma.activity.create({
              data: {
                cardId: card.id,
                cardSlug: slug,
                type: actTypes[a],
                platform: actPlatforms[a],
                price: Math.round(psa10Price * (0.95 + Math.random() * 0.1) * 100) / 100,
                from: BIDDERS[a % BIDDERS.length].bidder,
                to: actTypes[a] === 'sale' ? BIDDERS[(a + 1) % BIDDERS.length].bidder : '',
                time: new Date(now.getTime() - (a + 1) * 4 * 60 * 60 * 1000),
              },
            });
          }

          createdCards.push(`${tcgCard.name} (${tcgCard.set.name})`);
        }

        // Rate limit API calls
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Import error for query:', query, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${createdCards.length} cards with real Pokemon TCG API data`,
      cards: createdCards,
    });
  } catch (error) {
    console.error('Import route error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}


/**
 * Ingestion service â normalizes listings from all platforms into
 * the common Listing schema, deduplicates by cert number, and
 * updates Card aggregate stats.
 */

import { prisma } from '@/lib/prisma';
import { searchEbayForCard, type EbayListing } from './ebay';
import { scrapePwcc, type PwccListing } from './scraper-pwcc';
import { scrapeCardmarket, type CardmarketListing } from './scraper-cardmarket';

type RawListing = EbayListing | PwccListing | CardmarketListing;

interface NormalizedListing {
  cardName: string;
  set: string;
  edition: string;
  grade: string;
  grader: 'PSA';
  cert: string;
  platform: 'ebay' | 'pwcc' | 'cm';
  priceEur: number;
  url: string;
  imageUrl: string;
  scrapedAt: Date;
}

const BUYER_FEES: Record<string, string> = {
  ebay: '3%',
  pwcc: '5%',
  cm: '2%',
};

const SELLER_FEES: Record<string, string> = {
  ebay: '13%',
  pwcc: '8%',
  cm: '5%',
};

function normalize(listing: RawListing): NormalizedListing {
  return {
    cardName: listing.cardName,
    set: listing.set || '',
    edition: listing.edition,
    grade: listing.grade,
    grader: 'PSA',
    cert: listing.cert,
    platform: listing.platform,
    priceEur: listing.priceEur,
    url: 'itemUrl' in listing ? listing.itemUrl : '',
    imageUrl: listing.imageUrl || '',
    scrapedAt: listing.scrapedAt,
  };
}

async function findOrCreateCard(listing: NormalizedListing): Promise<string> {
  const slug = `${listing.cardName}-${listing.set}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  let card = await prisma.card.findUnique({ where: { slug } });
  if (card) return card.id;

  const nameWords = listing.cardName.split(/\s+/).filter(w => w.length > 2);
  if (nameWords.length > 0) {
    const existing = await prisma.card.findFirst({
      where: {
        OR: nameWords.map(word => ({
          name: { contains: word, mode: 'insensitive' as const },
        })),
      },
    });
    if (existing) return existing.id;
  }

  const numMatch = listing.cardName.match(/#(\d+)/);
  const number = numMatch ? numMatch[1] : '0';

  card = await prisma.card.create({
    data: {
      name: listing.cardName,
      set: listing.set || 'Unknown',
      number,
      year: listing.set?.includes('Base') ? 1999 : new Date().getFullYear(),
      edition: listing.edition,
      variant: listing.grade.includes('10') ? 'Holo' : 'Non-Holo',
      imageUrl: listing.imageUrl || '',
      slug,
      floorPrice: listing.priceEur,
      lastSale: listing.priceEur,
      listingCount: 1,
    },
  });

  return card.id;
}

async function ingestListings(listings: NormalizedListing[]): Promise<{ created: number; updated: number; skipped: number }> {
  let created = 0, updated = 0, skipped = 0;

  for (const listing of listings) {
    try {
      if (!listing.priceEur || listing.priceEur <= 0) {
        skipped++;
        continue;
      }

      const cardId = await findOrCreateCard(listing);

      if (listing.cert) {
        const existing = await prisma.listing.findFirst({
          where: { cert: listing.cert, platform: listing.platform },
        });

        if (existing) {
          if (Math.abs(existing.price - listing.priceEur) > 0.01) {
            await prisma.listing.update({
              where: { id: existing.id },
              data: {
                price: listing.priceEur,
                scrapedAt: listing.scrapedAt,
                url: listing.url || existing.url,
              },
            });
            updated++;
          } else {
            skipped++;
          }
          continue;
        }
      }

      await prisma.listing.create({
        data: {
          cardId,
          platform: listing.platform,
          price: listing.priceEur,
          currency: 'EUR',
          url: listing.url,
          cert: listing.cert || `${listing.platform}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          grade: listing.grade,
          edition: listing.edition,
          buyerFee: BUYER_FEES[listing.platform] || '0%',
          sellerFee: SELLER_FEES[listing.platform] || '0%',
          isBest: false,
          scrapedAt: listing.scrapedAt,
        },
      });
      created++;

      const card = await prisma.card.findUnique({ where: { id: cardId } });
      if (card) {
        await prisma.activity.create({
          data: {
            cardId,
            cardSlug: card.slug,
            type: 'listing',
            platform: listing.platform,
            price: listing.priceEur,
            from: listing.platform === 'ebay' ? 'eBay Seller' :
                  listing.platform === 'pwcc' ? 'PWCC Vault' :
                  'Cardmarket Seller',
            to: '',
            time: listing.scrapedAt,
          },
        });
      }
    } catch (err) {
      console.error('Ingest error for listing:', listing.cardName, err);
      skipped++;
    }
  }

  return { created, updated, skipped };
}

async function updateCardStats(): Promise<void> {
  const cards = await prisma.card.findMany({
    include: {
      listings: { orderBy: { price: 'asc' } },
      offers: { orderBy: { amount: 'desc' } },
      _count: { select: { listings: true, offers: true } },
    },
  });

  for (const card of cards) {
    const floorListing = card.listings[0];
    const topOffer = card.offers[0];

    if (floorListing) {
      await prisma.listing.updateMany({
        where: { cardId: card.id, isBest: true },
        data: { isBest: false },
      });
      await prisma.listing.update({
        where: { id: floorListing.id },
        data: { isBest: true },
      });
    }

    await prisma.card.update({
      where: { id: card.id },
      data: {
        floorPrice: floorListing?.price ?? card.floorPrice,
        topBid: topOffer?.amount ?? card.topBid,
        listingCount: card._count.listings,
        offerCount: card._count.offers,
      },
    });

    if (floorListing) {
      await prisma.priceSnapshot.create({
        data: {
          cardId: card.id,
          price: floorListing.price,
          date: new Date(),
        },
      });
    }
  }
}

export async function scrapeAllPlatforms(query: string): Promise<{
  ebay: { fetched: number; ingested: { created: number; updated: number; skipped: number } };
  pwcc: { fetched: number; ingested: { created: number; updated: number; skipped: number } };
  cm: { fetched: number; ingested: { created: number; updated: number; skipped: number } };
  statsUpdated: boolean;
}> {
  const results = {
    ebay: { fetched: 0, ingested: { created: 0, updated: 0, skipped: 0 } },
    pwcc: { fetched: 0, ingested: { created: 0, updated: 0, skipped: 0 } },
    cm: { fetched: 0, ingested: { created: 0, updated: 0, skipped: 0 } },
    statsUpdated: false,
  };

  try {
    if (process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET) {
      const ebayListings = await searchEbayForCard(query);
      results.ebay.fetched = ebayListings.length;
      const normalized = ebayListings.map(normalize);
      results.ebay.ingested = await ingestListings(normalized);
    } else {
      console.log('eBay: skipped (no credentials)');
    }
  } catch (err) {
    console.error('eBay scrape error:', err);
  }

  try {
    const pwccListings = await scrapePwcc(query);
    results.pwcc.fetched = pwccListings.length;
    const normalized = pwccListings.map(normalize);
    results.pwcc.ingested = await ingestListings(normalized);
  } catch (err) {
    console.error('PWCC scrape error:', err);
  }

  try {
    const cmListings = await scrapeCardmarket(query);
    results.cm.fetched = cmListings.length;
    const normalized = cmListings.map(normalize);
    results.cm.ingested = await ingestListings(normalized);
  } catch (err) {
    console.error('Cardmarket scrape error:', err);
  }

  try {
    await updateCardStats();
    results.statsUpdated = true;
  } catch (err) {
    console.error('Stats update error:', err);
  }

  return results;
}

export async function runFullScrape(): Promise<Record<string, any>> {
  const queries = [
    'Charizard Base Set',
    'Blastoise Base Set',
    'Venusaur Base Set',
    'Pikachu',
    'Mewtwo',
    'Mew',
    'Lugia',
    'Gengar',
    'Dragonite',
    'Alakazam',
    'Gyarados',
    'Eevee',
    'Umbreon',
    'Rayquaza',
    'Charizard VMAX',
    'Moonbreon',
    'Gold Star',
    'Illustration Rare',
    'Special Art Rare',
    'Alt Art',
  ];

  const allResults: Record<string, any> = {};

  for (const query of queries) {
    console.log(`Scraping: ${query}...`);
    try {
      allResults[query] = await scrapeAllPlatforms(query);
    } catch (err) {
      allResults[query] = { error: String(err) };
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return allResults;
}

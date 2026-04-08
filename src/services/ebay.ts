/**
 * eBay Browse API integration for PSA PokÃ©mon TCG slab listings.
 * Uses /buy/browse/v1/item_summary/search with conditionIds=3000 (seller refurbished/graded).
 *
 * Requires env: EBAY_CLIENT_ID, EBAY_CLIENT_SECRET
 * Auth: OAuth2 Client Credentials grant â Application token
 */

export interface EbayListing {
  title: string;
  price: number;
  currency: string;
  priceEur: number;
  itemId: string;
  itemUrl: string;
  imageUrl: string;
  seller: string;
  cert: string;
  grade: string;
  cardName: string;
  set: string;
  edition: string;
  platform: 'ebay';
  scrapedAt: Date;
}

// Cache the FX rate for 24 hours
let cachedFxRate: { rate: number; fetchedAt: number } | null = null;

async function getUsdToEurRate(): Promise<number> {
  if (cachedFxRate && Date.now() - cachedFxRate.fetchedAt < 24 * 60 * 60 * 1000) {
    return cachedFxRate.rate;
  }
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    const rate = data.rates?.EUR ?? 0.92;
    cachedFxRate = { rate, fetchedAt: Date.now() };
    return rate;
  } catch {
    return cachedFxRate?.rate ?? 0.92;
  }
}

async function getEbayAccessToken(): Promise<string> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('EBAY_CLIENT_ID and EBAY_CLIENT_SECRET must be set');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay OAuth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Parse PSA grade, cert number, card name, and set from eBay title.
 * Typical format: "PSA 10 GEM MINT Charizard Base Set 1999 #4 Holo"
 */
function parseEbayTitle(title: string): { grade: string; cert: string; cardName: string; set: string; edition: string } {
  const gradeMatch = title.match(/PSA\s+(\d+)/i);
  const grade = gradeMatch ? `PSA ${gradeMatch[1]}` : 'PSA 10';

  const certMatch = title.match(/(?:cert|#|certification)\s*[:#]?\s*(\d{7,8})/i);
  const cert = certMatch ? certMatch[1] : '';

  // Try to extract edition
  let edition = 'Unlimited';
  if (/1st\s*edition/i.test(title)) edition = '1st Edition';
  else if (/shadowless/i.test(title)) edition = 'Shadowless';

  // Known sets
  const sets = ['Base Set', 'Jungle', 'Fossil', 'Team Rocket', 'Gym Heroes', 'Gym Challenge',
    'Neo Genesis', 'Neo Discovery', 'Neo Revelation', 'Neo Destiny', 'Legendary Collection',
    'Expedition', 'Aquapolis', 'Skyridge', 'Paldean Fates', 'Obsidian Flames', 'Scarlet & Violet',
    'Crown Zenith', 'Silver Tempest', 'Evolving Skies', 'Fusion Strike', 'Celebrations',
    'Shining Fates', 'Vivid Voltage', 'Champions Path', 'Hidden Fates', 'Phantom Forces',
    'Flashfire', 'Primal Clash', 'Roaring Skies', 'Ancient Origins', 'BREAKthrough',
    'Paradox Rift', 'Temporal Forces', 'Twilight Masquerade', 'Shrouded Fable', '151',
    'Surging Sparks', 'Prismatic Evolutions'];
  let set = '';
  for (const s of sets) {
    if (title.toLowerCase().includes(s.toLowerCase())) { set = s; break; }
  }

  // Clean card name: remove PSA, grade, cert, set info
  let cardName = title
    .replace(/PSA\s+\d+/gi, '')
    .replace(/GEM\s*MINT/gi, '')
    .replace(/MINT/gi, '')
    .replace(/cert[:#]?\s*\d+/gi, '')
    .replace(/1st\s*edition/gi, '')
    .replace(/shadowless/gi, '')
    .replace(/unlimited/gi, '')
    .replace(/pokemon|pokÃ©mon/gi, '')
    .replace(/tcg/gi, '')
    .replace(new RegExp(set.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to get just the PokÃ©mon name
  const pokemonMatch = cardName.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (pokemonMatch) cardName = pokemonMatch[1];

  return { grade, cert, cardName: cardName || title, set, edition };
}

export async function searchEbayListings(query: string, limit = 50): Promise<EbayListing[]> {
  const token = await getEbayAccessToken();
  const fxRate = await getUsdToEurRate();

  const params = new URLSearchParams({
    q: `PSA pokemon ${query} slab`,
    category_ids: '183454', // PokÃ©mon TCG Individual Cards
    filter: 'conditionIds:{3000},deliveryCountry:US,priceCurrency:USD,price:[5..],buyingOptions:{FIXED_PRICE}',
    sort: 'price',
    limit: String(Math.min(limit, 200)),
  });

  const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay search failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const items = data.itemSummaries || [];
  const now = new Date();

  return items
    .filter((item: any) => {
      const title = (item.title || '').toLowerCase();
      return title.includes('psa') && (title.includes('pokemon') || title.includes('pokÃ©mon'));
    })
    .map((item: any) => {
      const priceUsd = parseFloat(item.price?.value || '0');
      const parsed = parseEbayTitle(item.title || '');
      return {
        title: item.title,
        price: priceUsd,
        currency: item.price?.currency || 'USD',
        priceEur: Math.round(priceUsd * fxRate * 100) / 100,
        itemId: item.itemId,
        itemUrl: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
        imageUrl: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || '',
        seller: item.seller?.username || '',
        cert: parsed.cert || item.itemId?.slice(-8) || '',
        grade: parsed.grade,
        cardName: parsed.cardName,
        set: parsed.set,
        edition: parsed.edition,
        platform: 'ebay' as const,
        scrapedAt: now,
      };
    });
}

/**
 * Search eBay for a specific card by name.
 */
export async function searchEbayForCard(cardName: string, set?: string, grade?: string): Promise<EbayListing[]> {
  const parts = [cardName];
  if (set) parts.push(set);
  if (grade) parts.push(grade);
  return searchEbayListings(parts.join(' '));
}

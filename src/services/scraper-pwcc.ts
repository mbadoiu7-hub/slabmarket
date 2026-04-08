/**
 * PWCC Marketplace scraper for PSA PokÃ©mon TCG slabs.
 * Scrapes pwcc.com auction/fixed-price results.
 * Uses fetch + HTML parsing (no Playwright required for initial version).
 */

export interface PwccListing {
  title: string;
  price: number;
  priceEur: number;
  currency: string;
  itemUrl: string;
  imageUrl: string;
  cert: string;
  grade: string;
  cardName: string;
  set: string;
  edition: string;
  platform: 'pwcc';
  scrapedAt: Date;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function parsePwccTitle(title: string): { grade: string; cert: string; cardName: string; set: string; edition: string } {
  const gradeMatch = title.match(/PSA\s+(\d+)/i);
  const grade = gradeMatch ? `PSA ${gradeMatch[1]}` : 'PSA 10';

  const certMatch = title.match(/(?:cert|#)\s*(\d{7,8})/i);
  const cert = certMatch ? certMatch[1] : '';

  let edition = 'Unlimited';
  if (/1st\s*ed/i.test(title)) edition = '1st Edition';
  else if (/shadowless/i.test(title)) edition = 'Shadowless';

  let cardName = title
    .replace(/PSA\s+\d+/gi, '')
    .replace(/GEM\s*MINT/gi, '')
    .replace(/\d{7,8}/g, '')
    .replace(/pokemon|pokÃ©mon/gi, '')
    .replace(/1st\s*ed(?:ition)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { grade, cert, cardName: cardName || title, set: '', edition };
}

/**
 * Scrape PWCC marketplace for PokÃ©mon PSA slabs.
 * PWCC has an API-like search endpoint that returns HTML.
 */
export async function scrapePwcc(query: string, maxPages = 2): Promise<PwccListing[]> {
  const results: PwccListing[] = [];
  const now = new Date();

  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = `https://www.pwccmarketplace.com/market-price-research?q=${encodeURIComponent(`PSA pokemon ${query}`)}&page=${page}&category=pokemon`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.pwccmarketplace.com/',
        },
      });

      if (!res.ok) {
        console.error(`PWCC scrape failed page ${page}: ${res.status}`);
        continue;
      }

      const html = await res.text();

      // Parse listing cards from HTML
      // PWCC uses structured data-rich cards with price, title, image
      const itemRegex = /<div[^>]*class="[^"]*item-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
      const titleRegex = /<(?:h[23456]|a|span)[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>(.*?)<\//i;
      const priceRegex = /\$\s*([\d,]+(?:\.\d{2})?)/;
      const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/i;
      const linkRegex = /<a[^>]*href="([^"]*\/item\/[^"]*)"[^>]*>/i;

      let match;
      while ((match = itemRegex.exec(html)) !== null) {
        const block = match[1];

        const titleMatch = titleRegex.exec(block);
        const priceMatch = priceRegex.exec(block);
        const imgMatch = imgRegex.exec(block);
        const linkMatch = linkRegex.exec(block);

        if (titleMatch && priceMatch) {
          const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
          const priceUsd = parseFloat(priceMatch[1].replace(/,/g, ''));
          const priceEur = Math.round(priceUsd * 0.92 * 100) / 100;
          const parsed = parsePwccTitle(title);

          results.push({
            title,
            price: priceUsd,
            priceEur,
            currency: 'USD',
            itemUrl: linkMatch ? `https://www.pwccmarketplace.com${linkMatch[1]}` : '',
            imageUrl: imgMatch ? imgMatch[1] : '',
            cert: parsed.cert,
            grade: parsed.grade,
            cardName: parsed.cardName,
            set: parsed.set,
            edition: parsed.edition,
            platform: 'pwcc',
            scrapedAt: now,
          });
        }
      }

      // Alternative: try JSON-LD or API-like patterns
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
      if (jsonLdMatch) {
        for (const script of jsonLdMatch) {
          try {
            const jsonStr = script.replace(/<\/?script[^>]*>/g, '');
            const data = JSON.parse(jsonStr);
            if (data['@type'] === 'Product' || data['@type'] === 'ItemList') {
              const items = data.itemListElement || [data];
              for (const item of items) {
                const product = item.item || item;
                if (!product.name || !product.offers) continue;
                const price = parseFloat(product.offers.price || '0');
                if (price <= 0) continue;

                const parsed = parsePwccTitle(product.name);
                results.push({
                  title: product.name,
                  price,
                  priceEur: Math.round(price * 0.92 * 100) / 100,
                  currency: 'USD',
                  itemUrl: product.url || '',
                  imageUrl: product.image || '',
                  cert: parsed.cert,
                  grade: parsed.grade,
                  cardName: parsed.cardName,
                  set: parsed.set,
                  edition: parsed.edition,
                  platform: 'pwcc',
                  scrapedAt: now,
                });
              }
            }
          } catch { /* skip invalid JSON-LD */ }
        }
      }
    } catch (err) {
      console.error(`PWCC scrape error page ${page}:`, err);
    }
  }

  return results;
}

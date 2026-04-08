/**
 * Cardmarket scraper for PSA PokÃ©mon TCG slabs.
 * Scrapes cardmarket.com/en/Pokemon for graded singles.
 * Uses fetch + HTML parsing with rotating user agents.
 */

export interface CardmarketListing {
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
  seller: string;
  platform: 'cm';
  scrapedAt: Date;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function parseCardmarketTitle(title: string): { grade: string; cert: string; cardName: string; set: string; edition: string } {
  const gradeMatch = title.match(/PSA\s+(\d+)/i);
  const grade = gradeMatch ? `PSA ${gradeMatch[1]}` : 'PSA 10';

  const certMatch = title.match(/(\d{7,8})/);
  const cert = certMatch ? certMatch[1] : '';

  let edition = 'Unlimited';
  if (/1st\s*ed/i.test(title)) edition = '1st Edition';

  let cardName = title
    .replace(/PSA\s+\d+/gi, '')
    .replace(/GEM\s*MINT/gi, '')
    .replace(/\d{7,8}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { grade, cert, cardName: cardName || title, set: '', edition };
}

/**
 * Scrape Cardmarket for PokÃ©mon PSA graded cards.
 * Cardmarket has a product search that returns HTML with structured data.
 */
export async function scrapeCardmarket(query: string, maxPages = 2): Promise<CardmarketListing[]> {
  const results: CardmarketListing[] = [];
  const now = new Date();

  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(`PSA ${query}`)}&page=${page}&mode=gallery&idCategory=0&idExpansion=0&idRarity=0`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.cardmarket.com/en/Pokemon',
        },
      });

      if (!res.ok) {
        console.error(`Cardmarket scrape failed page ${page}: ${res.status}`);
        continue;
      }

      const html = await res.text();

      // Parse product tiles from HTML
      // Cardmarket uses structured product cards with data attributes
      const productRegex = /<div[^>]*class="[^"]*(?:product-card|col-product)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
      const nameRegex = /<(?:a|span|h\d)[^>]*class="[^"]*(?:product-name|name)[^"]*"[^>]*>(.*?)<\//i;
      const priceRegex = /(?:â¬|EUR)\s*([\d.,]+)/i;
      const altPriceRegex = /(\d+[.,]\d{2})\s*â¬/;
      const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/i;
      const linkRegex = /<a[^>]*href="(\/en\/Pokemon\/Products\/[^"]*)"[^>]*>/i;
      const sellerRegex = /class="[^"]*seller[^"]*"[^>]*>([^<]+)/i;

      let match;
      while ((match = productRegex.exec(html)) !== null) {
        const block = match[1];

        const nameMatch = nameRegex.exec(block);
        const pMatch = priceRegex.exec(block) || altPriceRegex.exec(block);
        const imgMatch = imgRegex.exec(block);
        const linkMatch = linkRegex.exec(block);
        const sellMatch = sellerRegex.exec(block);

        if (nameMatch && pMatch) {
          const title = nameMatch[1].replace(/<[^>]*>/g, '').trim();
          const priceStr = pMatch[1].replace(',', '.');
          const price = parseFloat(priceStr);
          const parsed = parseCardmarketTitle(title);

          if (price > 0) {
            results.push({
              title,
              price,
              priceEur: price, // Cardmarket is already in EUR
              currency: 'EUR',
              itemUrl: linkMatch ? `https://www.cardmarket.com${linkMatch[1]}` : '',
              imageUrl: imgMatch ? imgMatch[1] : '',
              cert: parsed.cert,
              grade: parsed.grade,
              cardName: parsed.cardName,
              set: parsed.set,
              edition: parsed.edition,
              seller: sellMatch ? sellMatch[1].trim() : '',
              platform: 'cm',
              scrapedAt: now,
            });
          }
        }
      }

      // Also try JSON-LD structured data
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
      if (jsonLdMatches) {
        for (const script of jsonLdMatches) {
          try {
            const jsonStr = script.replace(/<\/?script[^>]*>/g, '');
            const data = JSON.parse(jsonStr);
            const items = data.itemListElement || (data['@type'] === 'Product' ? [data] : []);
            for (const item of items) {
              const product = item.item || item;
              if (!product.name) continue;
              const price = parseFloat(product.offers?.price || product.offers?.lowPrice || '0');
              if (price <= 0) continue;

              const parsed = parseCardmarketTitle(product.name);
              results.push({
                title: product.name,
                price,
                priceEur: price,
                currency: 'EUR',
                itemUrl: product.url || '',
                imageUrl: product.image || '',
                cert: parsed.cert,
                grade: parsed.grade,
                cardName: parsed.cardName,
                set: parsed.set,
                edition: parsed.edition,
                seller: '',
                platform: 'cm',
                scrapedAt: now,
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      console.error(`Cardmarket scrape error page ${page}:`, err);
    }
  }

  return results;
}

import { NextResponse } from 'next/server';
import { scrapeAllPlatforms, runFullScrape } from '@/services/ingestion';

export const maxDuration = 300; // Allow up to 5 minutes for scraping
export const dynamic = 'force-dynamic';

/**
 * GET /api/scrape?q=charizard â scrape a specific card query
 * GET /api/scrape?full=true â run the full scrape cycle for all popular cards
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const full = searchParams.get('full');

  try {
    if (full === 'true') {
      const results = await runFullScrape();
      return NextResponse.json({
        success: true,
        mode: 'full',
        results,
      });
    }

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Provide ?q=cardname to scrape a specific card, or ?full=true for full cycle',
        example: '/api/scrape?q=charizard',
      }, { status: 400 });
    }

    const results = await scrapeAllPlatforms(query);
    return NextResponse.json({
      success: true,
      query,
      results,
    });
  } catch (error) {
    console.error('Scrape route error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}


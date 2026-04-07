import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get('sort') || 'name'
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const orderBy: any = {}
    switch (sort) {
      case 'volume':
        orderBy.volume24h = 'desc'
        break
      case 'price':
        orderBy.floorPrice = 'asc'
        break
      case 'trending':
        orderBy.change24h = 'desc'
        break
      default:
        orderBy.name = 'asc'
    }

    const cards = await prisma.card.findMany({
      where,
      include: {
        _count: {
          select: {
            listings: true,
            offers: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    })

    const total = await prisma.card.count({ where })

    const cardsWithCounts = cards.map((card) => ({
      ...card,
      listingCount: card._count.listings,
      offerCount: card._count.offers,
    }))

    return NextResponse.json(
      {
        cards: cardsWithCounts,
        total,
        limit,
        offset,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/cards error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}

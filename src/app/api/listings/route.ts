import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cardSlug = searchParams.get('card')
    const grade = searchParams.get('grade')
    const platform = searchParams.get('platform')
    const sort = searchParams.get('sort') || 'price'
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let where: any = {}

    if (cardSlug) {
      where.card = {
        slug: cardSlug,
      }
    }

    if (grade) {
      where.grade = grade
    }

    if (platform && platform !== 'all') {
      where.platform = platform
    }

    if (search) {
      where.card = {
        ...where.card,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }
    }

    const orderBy: any = {}
    if (sort === '-price') {
      orderBy.price = 'desc'
    } else if (sort === 'date') {
      orderBy.scrapedAt = 'desc'
    } else {
      orderBy.price = 'asc'
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        card: true,
      },
      orderBy,
      take: limit,
      skip: offset,
    })

    const total = await prisma.listing.count({ where })

    return NextResponse.json(
      {
        listings,
        total,
        limit,
        offset,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/listings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

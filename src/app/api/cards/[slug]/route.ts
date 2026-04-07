import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const card = await prisma.card.findUnique({
      where: { slug },
      include: {
        listings: {
          orderBy: {
            price: 'asc',
          },
        },
        offers: {
          orderBy: {
            amount: 'desc',
          },
        },
        priceSnapshots: {
          orderBy: {
            date: 'asc',
          },
        },
        activities: {
          orderBy: {
            time: 'desc',
          },
          take: 50,
        },
        _count: {
          select: {
            listings: true,
            offers: true,
          },
        },
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        ...card,
        listingCount: card._count.listings,
        offerCount: card._count.offers,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(`GET /api/cards/[slug] error:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    )
  }
}

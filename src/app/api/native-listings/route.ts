import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cardId = searchParams.get('cardId')

    let where: any = {
      status: 'active',
    }

    if (cardId) {
      where.cardId = cardId
    }

    const nativeListings = await prisma.nativeListing.findMany({
      where,
      include: {
        card: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(nativeListings, { status: 200 })
  } catch (error) {
    console.error('GET /api/native-listings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch native listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardSlug, sellerEmail, grade, cert, price, photos } = body

    if (!cardSlug || !sellerEmail || !grade || !price) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: cardSlug, sellerEmail, grade, price',
        },
        { status: 400 }
      )
    }

    const card = await prisma.card.findUnique({
      where: { slug: cardSlug },
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    const nativeListing = await prisma.nativeListing.create({
      data: {
        cardId: card.id,
        sellerEmail,
        grade,
        cert: cert || '',
        price,
        photos: photos || [],
        status: 'active',
      },
      include: {
        card: true,
      },
    })

    const listing = await prisma.listing.create({
      data: {
        cardId: card.id,
        platform: 'slab',
        price,
        currency: 'EUR',
        url: '',
        cert: cert || '',
        grade,
        edition: '',
        buyerFee: '0%',
        sellerFee: '1%',
        isBest: false,
        scrapedAt: new Date(),
      },
      include: {
        card: true,
      },
    })

    return NextResponse.json(
      {
        nativeListing,
        listing,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/native-listings error:', error)
    return NextResponse.json(
      { error: 'Failed to create native listing' },
      { status: 500 }
    )
  }
}

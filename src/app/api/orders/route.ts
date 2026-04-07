import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateBuyerFee } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const buyerEmail = searchParams.get('buyerEmail')

    let where: any = {}
    if (buyerEmail) {
      where.buyerEmail = buyerEmail
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        listing: {
          include: {
            card: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, buyerEmail } = body

    if (!listingId || !buyerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: listingId, buyerEmail' },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { card: true },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const buyerFee = calculateBuyerFee(listing.price, listing.platform)
    const total = listing.price + buyerFee

    const order = await prisma.order.create({
      data: {
        listingId,
        buyerEmail,
        total,
        buyerFee,
        status: 'pending',
        stripePaymentId: null,
      },
      include: {
        listing: {
          include: {
            card: true,
          },
        },
      },
    })

    const mockClientSecret = `pi_${order.id}_secret_${Date.now()}`

    return NextResponse.json(
      {
        ...order,
        clientSecret: mockClientSecret,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

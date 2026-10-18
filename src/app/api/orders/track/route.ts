import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ error: 'Please provide an order number or AWB number' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: q, mode: 'insensitive' } },
          {
            shipments: {
              some: {
                trackingNumber: { equals: q, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        items: true,
        shipments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'No order found matching your tracking reference' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        total: order.total,
        paymentMethod: order.paymentMethod,
        items: order.items.map((i) => ({
          id: i.id,
          title: i.title,
          quantity: i.quantity,
          total: i.total,
        })),
        shipments: order.shipments.map((s) => ({
          courierName: s.courierName,
          trackingNumber: s.trackingNumber,
          status: s.status,
          dispatchedAt: s.dispatchedAt,
          deliveredAt: s.deliveredAt,
        })),
      },
    });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json({ error: 'Failed to query tracking database' }, { status: 500 });
  }
}

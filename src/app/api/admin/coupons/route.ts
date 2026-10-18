import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Role, DiscountType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValueRupees,
      maxDiscountRupees,
      daysValid,
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Please provide coupon code and discount value' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description,
        discountType: discountType === 'FIXED' ? DiscountType.FIXED : DiscountType.PERCENTAGE,
        discountValue:
          discountType === 'FIXED'
            ? Math.round(Number(discountValue) * 100)
            : Number(discountValue),
        minOrderValue: minOrderValueRupees ? Math.round(Number(minOrderValueRupees) * 100) : 0,
        maxDiscount: maxDiscountRupees ? Math.round(Number(maxDiscountRupees) * 100) : null,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + (Number(daysValid) || 30) * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error('Coupon creation error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

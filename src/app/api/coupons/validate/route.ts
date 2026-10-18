import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DiscountType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { code, cartSubtotal } = await req.json();

    if (!code || typeof cartSubtotal !== 'number') {
      return NextResponse.json({ valid: false, message: 'Invalid coupon request' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'Coupon code is invalid or has expired' });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ valid: false, message: 'This coupon is no longer active' });
    }

    if (cartSubtotal < coupon.minOrderValue) {
      const minRequired = coupon.minOrderValue / 100;
      return NextResponse.json({
        valid: false,
        message: `Add items worth ₹${minRequired.toFixed(0)} or more to use this coupon`,
      });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its maximum global usage limit' });
    }

    // Check user-specific limit if authenticated
    const session = await getCurrentUser();
    if (session) {
      const userRedemptions = await prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
          userId: session.userId,
        },
      });
      if (userRedemptions >= coupon.maxUsesPerUser) {
        return NextResponse.json({ valid: false, message: 'You have already used this coupon maximum allowed times' });
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = Math.round((cartSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, cartSubtotal);

    return NextResponse.json({
      valid: true,
      discountAmount,
      description: coupon.description || `Coupon ${coupon.code} applied`,
      message: `₹${(discountAmount / 100).toFixed(0)} savings applied with code ${coupon.code}!`,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ valid: false, message: 'Error checking coupon' }, { status: 500 });
  }
}

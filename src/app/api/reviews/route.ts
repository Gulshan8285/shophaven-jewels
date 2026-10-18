import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, rating, title, comment, customerName } = body;

    if (!productId || !rating || !comment || !customerName) {
      return NextResponse.json(
        { error: 'Product ID, Rating, Comment, and Customer Name are required.' },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5 stars.' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // Find or create customer user
    let user = await prisma.user.findFirst({
      where: { role: Role.CUSTOMER },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `buyer_${Date.now()}@shophaven.in`,
          name: customerName.trim(),
          role: Role.CUSTOMER,
          passwordHash: '$2a$10$wT0XkO0Xv8N/1O/h8h08u.aQzK6tF8C3m3q2kGz0j5n6k7l8m9n0p',
        },
      });
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        customerName: customerName.trim(),
        rating: numRating,
        title: title?.trim() || `${numRating}-Star Verified Review`,
        comment: comment.trim(),
        isApproved: true,
        verifiedPurchase: true,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Internal server error while submitting review.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId parameter is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

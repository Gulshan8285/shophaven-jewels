import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        brand: {
          select: { name: true, slug: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        supplier: {
          select: { id: true, name: true, address: true },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
          select: { id: true, url: true, altText: true },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            title: true,
            size: true,
            color: true,
            colorHex: true,
            price: true,
            stock: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviewCount = product.reviews.length;
    const avgRating =
      reviewCount > 0
        ? product.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviewCount
        : 4.8;

    return NextResponse.json({
      id: product.id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      specifications: product.specifications,
      regularPrice: product.regularPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      brand: product.brand,
      category: product.category,
      supplier: product.supplier,
      images: product.images,
      variants: product.variants,
      rating: Number(avgRating.toFixed(1)),
      reviewCount,
    });
  } catch (error: any) {
    console.error('Error fetching quick view product:', error);
    return NextResponse.json(
      { error: 'Failed to load product details' },
      { status: 500 }
    );
  }
}

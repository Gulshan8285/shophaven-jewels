import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      shortDescription,
      specifications,
      sku,
      regularPrice, // in paise
      sellingPrice, // in paise
      costPrice,
      stock,
      categoryId,
      brandId,
      supplierId,
      images, // array of url strings
      variants, // array of { title, sku, size, color, colorHex, stock, price }
      isFeatured,
      isBestseller,
      isTrending,
      tags,
    } = body;

    if (!title || !sku || !regularPrice || !sellingPrice || !categoryId) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    // Generate unique slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const slug = `${baseSlug}-${randomSuffix}`;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          title,
          slug,
          description: description || title,
          shortDescription,
          specifications,
          sku: sku.trim().toUpperCase(),
          regularPrice: Number(regularPrice),
          sellingPrice: Number(sellingPrice),
          costPrice: costPrice ? Number(costPrice) : null,
          stock: Number(stock) || 0,
          categoryId,
          brandId: brandId || null,
          supplierId: supplierId || null,
          isFeatured: Boolean(isFeatured),
          isBestseller: Boolean(isBestseller),
          isTrending: Boolean(isTrending),
          tags: tags || null,
        },
      });

      // Images
      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          if (images[i]) {
            await tx.productImage.create({
              data: {
                productId: created.id,
                url: images[i],
                isPrimary: i === 0,
                displayOrder: i,
              },
            });
          }
        }
      }

      // Variants
      if (variants && Array.isArray(variants)) {
        for (const v of variants) {
          if (v.title && v.sku) {
            await tx.productVariant.create({
              data: {
                productId: created.id,
                title: v.title,
                sku: v.sku.trim().toUpperCase(),
                size: v.size || null,
                color: v.color || null,
                colorHex: v.colorHex || null,
                stock: Number(v.stock) || 0,
                price: v.price ? Number(v.price) : created.sellingPrice,
              },
            });
          }
        }
      }

      // Supplier Product link
      if (supplierId) {
        await tx.supplierProduct.create({
          data: {
            supplierId,
            productId: created.id,
            supplierSku: created.sku,
            supplierPrice: created.costPrice || created.sellingPrice,
            syncStatus: 'SYNCED',
          },
        });
      }

      // Initial Inventory Log
      await tx.inventoryLog.create({
        data: {
          productId: created.id,
          change: created.stock,
          reason: 'MANUAL_RESTOCK',
          previousStock: 0,
          newStock: created.stock,
          createdBy: session.userId,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A product with this SKU or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

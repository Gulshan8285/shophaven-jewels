import React from 'react';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';
import ProductsManagerClient from '@/components/admin/ProductsManagerClient';

export default async function AdminProductsPage() {
  await checkAdminAccess();

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        supplier: { select: { name: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });
  } catch (err) {
    console.warn('DB query failed in AdminProductsPage, using fallback:', err);
    const fallback = (await import('@/lib/catalogFallback.json')).default;
    products = (fallback.products as any[]).map((p) => ({
      ...p,
      category: { name: p.category?.name || 'Jewellery' },
      brand: { name: p.brand?.name || 'Karigar Guild' },
      supplier: { name: 'Meesho Verified Supplier' },
      images: p.images || [],
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Product & Inventory Catalog
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage product pricing in INR, SKUs, real-time stock levels, and active status
        </p>
      </div>

      <ProductsManagerClient initialProducts={products} />
    </div>
  );
}

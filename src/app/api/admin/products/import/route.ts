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

    const { rows } = await req.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 });
    }

    // Cache categories & suppliers for mapping
    const categories = await prisma.category.findMany();
    const suppliers = await prisma.supplier.findMany();
    const categoryMap = new Map(categories.map((c) => [c.slug.toLowerCase(), c.id]));
    const supplierMap = new Map(suppliers.map((s) => [s.name.toLowerCase(), s.id]));
    const defaultCategoryId = categories[0]?.id;

    let importedCount = 0;
    const errors: { row: number; sku?: string; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const title = row['Title'] || row['title'] || row['Product Name'];
      const sku = (row['SKU'] || row['sku'] || `IMP-${Date.now()}-${i}`).trim().toUpperCase();
      const sellingPriceRupees = parseFloat(row['Selling Price'] || row['price'] || '0');
      const regularPriceRupees = parseFloat(row['Regular Price'] || row['mrp'] || String(sellingPriceRupees));
      const stock = parseInt(row['Stock'] || row['stock'] || '10', 10);
      const categorySlug = (row['Category'] || row['category'] || '').trim().toLowerCase();
      const supplierName = (row['Supplier'] || row['supplier'] || '').trim().toLowerCase();
      const imageUrl = row['Image URL'] || row['image'] || row['image_url'];
      const description = row['Description'] || row['description'] || title;

      if (!title || sellingPriceRupees <= 0) {
        errors.push({
          row: i + 1,
          sku,
          message: 'Missing product title or valid selling price',
        });
        continue;
      }

      const categoryId = categoryMap.get(categorySlug) || defaultCategoryId;
      const supplierId = supplierMap.get(supplierName) || null;

      try {
        const baseSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

        const product = await prisma.product.upsert({
          where: { sku },
          update: {
            title,
            sellingPrice: Math.round(sellingPriceRupees * 100),
            regularPrice: Math.round(regularPriceRupees * 100),
            stock,
            description,
            categoryId,
            supplierId,
          },
          create: {
            title,
            slug,
            sku,
            sellingPrice: Math.round(sellingPriceRupees * 100),
            regularPrice: Math.round(regularPriceRupees * 100),
            stock,
            description,
            categoryId,
            supplierId,
            isActive: true,
          },
        });

        if (imageUrl && imageUrl.startsWith('http')) {
          await prisma.productImage.deleteMany({ where: { productId: product.id } });
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: imageUrl.trim(),
              isPrimary: true,
              displayOrder: 0,
            },
          });
        }

        importedCount++;
      } catch (err: any) {
        errors.push({
          row: i + 1,
          sku,
          message: err.message || 'Database error during row upsert',
        });
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      failedCount: errors.length,
      errors,
      message: `Successfully processed ${importedCount} products. ${errors.length} rows rejected.`,
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({ error: 'Failed to process CSV file' }, { status: 500 });
  }
}

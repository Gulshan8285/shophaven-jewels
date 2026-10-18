import prisma from '@/lib/prisma';
import fallbackData from './catalogFallback.json';

const isLocalhostOnVercel =
  Boolean(process.env.VERCEL) &&
  (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost'));

export async function getHomePageData() {
  if (!isLocalhostOnVercel) {
    try {
      const [categories, trendingProducts, bestsellers, allProducts] = await Promise.all([
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: { _count: { select: { products: true } } },
        }),
        prisma.product.findMany({
          where: { isActive: true, isTrending: true },
          take: 8,
          include: {
            brand: true,
            images: { orderBy: { displayOrder: 'asc' }, take: 1 },
            reviews: { where: { isApproved: true }, select: { rating: true } },
          },
        }),
        prisma.product.findMany({
          where: { isActive: true, isBestseller: true },
          take: 8,
          include: {
            brand: true,
            images: { orderBy: { displayOrder: 'asc' }, take: 1 },
            reviews: { where: { isApproved: true }, select: { rating: true } },
          },
        }),
        prisma.product.findMany({
          where: { isActive: true },
          take: 12,
          orderBy: { createdAt: 'desc' },
          include: {
            brand: true,
            images: { orderBy: { displayOrder: 'asc' }, take: 1 },
            reviews: { where: { isApproved: true }, select: { rating: true } },
          },
        }),
      ]);

      if (categories.length > 0 && allProducts.length > 0) {
        return { categories, trendingProducts, bestsellers, allProducts };
      }
    } catch (err) {
      console.warn('Database query failed in getHomePageData, using fallback catalog:', err);
    }
  }

  // Fallback
  const categories = (fallbackData.categories as any[]) || [];
  const allProducts = (fallbackData.products as any[]) || [];
  const trendingProducts = allProducts.filter((p) => p.isTrending).slice(0, 8);
  const bestsellers = allProducts.filter((p) => p.isBestseller).slice(0, 8);

  return {
    categories,
    trendingProducts: trendingProducts.length > 0 ? trendingProducts : allProducts.slice(0, 8),
    bestsellers: bestsellers.length > 0 ? bestsellers : allProducts.slice(8, 16),
    allProducts: allProducts.slice(0, 12),
  };
}

export async function getShopData(params: {
  q?: string;
  category?: string;
  brand?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const { q = '', category = '', brand = '', sort = 'newest', minPrice, maxPrice } = params;

  if (!isLocalhostOnVercel) {
    try {
      const where: any = { isActive: true };

      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ];
      }
      if (category) where.category = { slug: category };
      if (brand) where.brand = { slug: brand };
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.sellingPrice = {};
        if (minPrice !== undefined) where.sellingPrice.gte = minPrice;
        if (maxPrice !== undefined) where.sellingPrice.lte = maxPrice;
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
      else if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
      else if (sort === 'bestseller') orderBy = { isBestseller: 'desc' };
      else if (sort === 'trending') orderBy = { isTrending: 'desc' };

      const [products, categories, brands] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          include: {
            brand: true,
            category: true,
            images: { orderBy: { displayOrder: 'asc' }, take: 1 },
            reviews: { where: { isApproved: true }, select: { rating: true } },
          },
        }),
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: { _count: { select: { products: true } } },
        }),
        prisma.brand.findMany({
          orderBy: { name: 'asc' },
          include: { _count: { select: { products: true } } },
        }),
      ]);

      if (products.length > 0 || categories.length > 0) {
        return { products, categories, brands, totalCount: products.length };
      }
    } catch (err) {
      console.warn('Database query failed in getShopData, using fallback catalog:', err);
    }
  }

  // Fallback filtering
  let filtered = [...((fallbackData.products as any[]) || [])];

  if (q) {
    const qLower = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.description?.toLowerCase().includes(qLower) ||
        p.tags?.toLowerCase().includes(qLower) ||
        p.sku?.toLowerCase().includes(qLower)
    );
  }

  if (category) {
    const normalizedCat = category === 'oxidised-bohemian' ? 'oxidised-boho' : category;
    filtered = filtered.filter((p) => p.category?.slug === normalizedCat || p.category?.slug === category);
  }

  if (brand) {
    filtered = filtered.filter((p) => p.brand?.slug === brand);
  }

  if (minPrice !== undefined) {
    filtered = filtered.filter((p) => p.sellingPrice >= minPrice);
  }

  if (maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.sellingPrice <= maxPrice);
  }

  // Sort
  if (sort === 'price_asc') filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
  else if (sort === 'bestseller') filtered.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
  else if (sort === 'trending') filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  else filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    products: filtered,
    categories: (fallbackData.categories as any[]) || [],
    brands: (fallbackData.brands as any[]) || [],
    totalCount: filtered.length,
  };
}

export async function getProductBySlug(slug: string) {
  if (!isLocalhostOnVercel) {
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          variants: { where: { isActive: true }, orderBy: { title: 'asc' } },
          reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
        },
      });

      if (product) {
        const relatedProducts = await prisma.product.findMany({
          where: { isActive: true, id: { not: product.id }, categoryId: product.categoryId },
          take: 4,
          include: {
            brand: true,
            images: { take: 1, orderBy: { displayOrder: 'asc' } },
            reviews: { where: { isApproved: true }, select: { rating: true } },
          },
        });

        return { product, relatedProducts };
      }
    } catch (err) {
      console.warn('Database query failed in getProductBySlug, using fallback catalog:', err);
    }
  }

  // Fallback
  const allProducts = (fallbackData.products as any[]) || [];
  const product = allProducts.find((p) => p.slug === slug);
  if (!product) return null;

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  return { product, relatedProducts };
}

export async function getCategoryBySlug(slug: string) {
  if (!isLocalhostOnVercel) {
    try {
      const normalizedSlug = slug === 'oxidised-bohemian' ? 'oxidised-boho' : slug;
      let category = await prisma.category.findUnique({
        where: { slug: normalizedSlug },
        include: {
          products: {
            where: { isActive: true },
            include: {
              brand: true,
              images: { orderBy: { displayOrder: 'asc' }, take: 1 },
              reviews: { where: { isApproved: true }, select: { rating: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!category && slug !== normalizedSlug) {
        category = await prisma.category.findUnique({
          where: { slug },
          include: {
            products: {
              where: { isActive: true },
              include: {
                brand: true,
                images: { orderBy: { displayOrder: 'asc' }, take: 1 },
                reviews: { where: { isApproved: true }, select: { rating: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      if (category) return category;
    } catch (err) {
      console.warn('Database query failed in getCategoryBySlug, using fallback catalog:', err);
    }
  }

  // Fallback
  const categories = (fallbackData.categories as any[]) || [];
  const normalizedSlug = slug === 'oxidised-bohemian' ? 'oxidised-boho' : slug;
  const cat = categories.find((c) => c.slug === normalizedSlug || c.slug === slug);
  if (!cat) return null;

  const allProducts = (fallbackData.products as any[]) || [];
  const categoryProducts = allProducts.filter((p) => p.categoryId === cat.id);

  return {
    ...cat,
    products: categoryProducts,
  };
}

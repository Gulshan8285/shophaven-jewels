import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/storefront/ProductCard';
import SortSelect from '@/components/storefront/SortSelect';
import { SlidersHorizontal, Search, ChevronRight, X, Cpu, Layers } from 'lucide-react';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const categorySlug = params.category || '';
  const brandSlug = params.brand || '';
  const sort = params.sort || 'newest';
  const minPrice = params.minPrice ? parseInt(params.minPrice) * 100 : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) * 100 : undefined;

  // Build Prisma where query
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.sellingPrice = {};
    if (minPrice !== undefined) where.sellingPrice.gte = minPrice;
    if (maxPrice !== undefined) where.sellingPrice.lte = maxPrice;
  }

  // Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
  else if (sort === 'bestseller') orderBy = { isBestseller: 'desc' };
  else if (sort === 'trending') orderBy = { isTrending: 'desc' };

  // Fetch products
  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1,
      },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-[#141416]">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 font-mono text-xs text-stone-500 mb-6">
        <Link href="/" className="hover:text-stone-900 transition-colors">HOME</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">[ ALL ARCHIVES ]</span>
        {categorySlug && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[#b91c1c] font-bold uppercase">{categorySlug.replace('-', ' ')}</span>
          </>
        )}
      </nav>

      {/* Collection Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#e6e2d8]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#b91c1c] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]" />
            <span>CATALOG TELEMETRY // ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-sans font-extrabold text-stone-900 tracking-tight mt-1">
            {q ? `Query: "${q}"` : categorySlug ? categorySlug.replace('-', ' ').toUpperCase() : 'Royal Jewellery Atelier Catalog'}
          </h1>
          <p className="font-mono text-xs text-stone-500 mt-1">
            Displaying {products.length} handcrafted artisan jewellery items (Direct Karigar Guilds)
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto font-mono text-xs">
          <span className="text-stone-500">SORT:</span>
          <SortSelect defaultValue={sort} />
        </div>
      </div>

      {/* Active Filter Chips */}
      {(categorySlug || brandSlug || q || minPrice || maxPrice) && (
        <div className="flex flex-wrap items-center gap-2 py-4 font-mono">
          <span className="text-xs text-stone-500">ACTIVE FILTERS:</span>
          {categorySlug && (
            <Link
              href={`/shop?${brandSlug ? `brand=${brandSlug}&` : ''}${sort ? `sort=${sort}` : ''}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#e6e2d8] hover:border-stone-900 text-stone-900 text-xs font-bold shadow-xs"
            >
              CATEGORY: {categorySlug} <X className="w-3.5 h-3.5 text-[#b91c1c]" />
            </Link>
          )}
          {q && (
            <Link
              href={`/shop?${categorySlug ? `category=${categorySlug}&` : ''}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#e6e2d8] hover:border-stone-900 text-stone-900 text-xs font-bold shadow-xs"
            >
              KEYWORD: {q} <X className="w-3.5 h-3.5 text-[#b91c1c]" />
            </Link>
          )}
          <Link
            href="/shop"
            className="text-xs font-bold text-[#b91c1c] hover:underline ml-2"
          >
            [ CLEAR ALL ]
          </Link>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start pt-6">
        
        {/* Left Filter Sidebar */}
        <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-[#e6e2d8] space-y-6 sticky top-28 shadow-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6e2d8]">
            <span className="font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#b91c1c]" />
              SPEC FILTERS
            </span>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">[ CATEGORY ]</h4>
            <div className="space-y-1">
              <Link
                href="/shop"
                className={`block text-xs py-2 px-3 rounded-xl transition-colors ${
                  !categorySlug ? 'bg-stone-900 text-white font-bold' : 'text-stone-600 hover:bg-[#faf8f5] hover:text-stone-900'
                }`}
              >
                All Archives
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}${sort ? `&sort=${sort}` : ''}`}
                  className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl transition-colors ${
                    categorySlug === cat.slug
                      ? 'bg-stone-900 text-white font-bold'
                      : 'text-stone-600 hover:bg-[#faf8f5] hover:text-stone-900'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={`text-[10px] ${categorySlug === cat.slug ? 'text-white/70' : 'text-stone-400'}`}>
                    [{cat._count.products}]
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Price Filters */}
          <div className="space-y-2 pt-3 border-t border-[#e6e2d8]">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">[ PRICE TIER ]</h4>
            <div className="flex flex-col gap-1 text-xs">
              <Link
                href={`/shop?${categorySlug ? `category=${categorySlug}&` : ''}maxPrice=699`}
                className="py-1.5 px-3 rounded-xl text-stone-600 hover:bg-[#faf8f5] hover:text-stone-900"
              >
                Under ₹699
              </Link>
              <Link
                href={`/shop?${categorySlug ? `category=${categorySlug}&` : ''}minPrice=700&maxPrice=1499`}
                className="py-1.5 px-3 rounded-xl text-stone-600 hover:bg-[#faf8f5] hover:text-stone-900"
              >
                ₹700 – ₹1,499
              </Link>
              <Link
                href={`/shop?${categorySlug ? `category=${categorySlug}&` : ''}minPrice=1500`}
                className="py-1.5 px-3 rounded-xl text-stone-600 hover:bg-[#faf8f5] hover:text-stone-900"
              >
                ₹1,500 and Above
              </Link>
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2 pt-3 border-t border-[#e6e2d8]">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">[ ARTISAN GUILD ]</h4>
            <div className="space-y-1">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/shop?brand=${b.slug}${categorySlug ? `&category=${categorySlug}` : ''}`}
                  className={`block text-xs py-1.5 px-3 rounded-xl transition-colors ${
                    brandSlug === b.slug
                      ? 'bg-stone-900 text-white font-bold'
                      : 'text-stone-600 hover:bg-[#faf8f5] hover:text-stone-900'
                  }`}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Products Grid */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#e6e2d8] p-12 text-center space-y-4 shadow-xs font-mono">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] text-stone-400 flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 uppercase">[ NO MATCHES FOUND ]</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No items match your active search or filter parameters. Try clearing filters.
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 rounded-full bg-stone-900 text-white hover:bg-stone-800 font-bold text-xs uppercase tracking-wider"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => {
                const avgRating =
                  product.reviews.length > 0
                    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
                    : 4.8;

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    slug={product.slug}
                    regularPrice={product.regularPrice}
                    sellingPrice={product.sellingPrice}
                    sku={product.sku}
                    brandName={product.brand?.name}
                    imageUrl={product.images[0]?.url}
                    rating={avgRating}
                    reviewCount={product.reviews.length || 38}
                    isBestseller={product.isBestseller}
                    isTrending={product.isTrending}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

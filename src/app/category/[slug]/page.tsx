import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/storefront/ProductCard';
import { Sparkles, ArrowRight, ChevronRight, Cpu } from 'lucide-react';
import type { Metadata } from 'next';

import { getCategoryBySlug } from '@/lib/catalogService';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Category Not Found | ShopHaven Direct' };
  }

  return {
    title: `${category.name} // Royal Jewellery Atelier | ShopHaven Jewels`,
    description: category.description || `Explore our handpicked collection of ${category.name} with Cash on Delivery and free shipping above ₹499.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141416] pb-16">
      {/* Category Header Banner */}
      <div className="bg-white border-b border-[#e6e2d8] py-12 px-4 sm:px-6 lg:px-8 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <nav className="flex items-center gap-2 text-xs text-stone-500">
              <Link href="/" className="hover:text-stone-900 transition-colors">HOME</Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <Link href="/shop" className="hover:text-stone-900 transition-colors">JEWELLERY</Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[#b91c1c] font-bold uppercase">{category.name}</span>
            </nav>

            <div className="flex items-center gap-2 text-[10px] text-[#b91c1c] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]" />
              <span>ATELIER GUILD // {category.slug.toUpperCase()}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight text-stone-900">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {category.description || 'Authentic jewellery pieces crafted directly by master artisans with 0% retail showroom markups.'}
            </p>
          </div>

          <div className="bg-[#faf8f5] rounded-2xl p-4 sm:p-5 border border-[#e6e2d8] flex items-center gap-5 text-xs shadow-xs">
            <div className="text-center">
              <span className="block font-bold text-2xl text-stone-900">{category.products.length}</span>
              <span className="text-stone-500 text-[10px] uppercase">Ready to Ship</span>
            </div>
            <div className="h-10 w-px bg-[#e6e2d8]"></div>
            <div>
              <span className="block font-bold text-stone-900 uppercase">[ 100% KARIGAR DIRECT ]</span>
              <span className="text-emerald-700 text-[11px] font-bold">● Doorstep COD Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {category.products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e6e2d8] p-12 text-center space-y-3 font-mono shadow-xs">
            <Sparkles className="w-8 h-8 text-[#b91c1c] mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-stone-900 uppercase">[ NEW ARCHIVES IN PRODUCTION ]</h3>
            <p className="text-xs text-stone-600">Our weaver partners are currently handloom crafting fresh stock for this catalog.</p>
            <Link
              href="/shop"
              className="inline-block mt-2 px-6 py-2.5 bg-stone-900 text-white hover:bg-stone-800 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
            >
              Explore Other Archives
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {category.products.map((product: any) => {
              const avgRating =
                product.reviews && product.reviews.length > 0
                  ? product.reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / product.reviews.length
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
  );
}

import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/storefront/ProductCard';
import HeroVideoShowcase from '@/components/storefront/HeroVideoShowcase';
import CustomerVideoReviews from '@/components/storefront/CustomerVideoReviews';
import { 
  Sparkles, 
  ArrowRight, 
  Truck, 
  RotateCcw, 
  Banknote,
  Star,
  ChevronRight,
  Cpu
} from 'lucide-react';

import { getHomePageData } from '@/lib/catalogService';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { categories, trendingProducts, bestsellers, allProducts } = await getHomePageData();

  return (
    <div className="flex flex-col min-h-screen bg-[#faf8f5] text-stone-900">
      
      {/* 1. Category Stories Bar (Creamy Luxury Styling) */}
      <section className="border-b border-[#e6e2d8] py-4 overflow-x-auto scrollbar-none bg-[#f4f1ea]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start sm:justify-center gap-5 sm:gap-9">
          
          {/* All Shop Avatar */}
          <Link href="/shop" className="flex flex-col items-center gap-2 shrink-0 group font-mono">
            <div className="relative w-15 h-15 sm:w-17 sm:h-17 rounded-2xl p-0.5 border-2 border-stone-900 group-hover:scale-105 transition-all shadow-xs bg-white">
              <div className="w-full h-full rounded-xl bg-stone-950 text-white flex flex-col items-center justify-center font-bold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mb-0.5" />
                <span className="tracking-wider">ALL</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-stone-900 group-hover:text-[#b91c1c] transition-colors uppercase tracking-wider">
              [ ALL SHOP ]
            </span>
          </Link>

          {/* Category Avatars */}
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="flex flex-col items-center gap-2 shrink-0 group font-mono">
              <div className="relative w-15 h-15 sm:w-17 sm:h-17 rounded-2xl p-0.5 border-2 border-stone-200 group-hover:border-[#b91c1c] transition-all overflow-hidden group-hover:scale-105 bg-white shadow-2xs">
                <img
                  src={c.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80'}
                  alt={c.name}
                  className="w-full h-full rounded-xl object-cover filter brightness-95 group-hover:brightness-100 transition-all"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-stone-700 group-hover:text-[#b91c1c] transition-colors truncate max-w-[85px] text-center uppercase tracking-wider">
                {c.name.replace("Women's ", "").replace("Men's ", "").replace("Smart ", "")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Editorial Luxury Hero Stage with Interactive Video Showcase */}
      <section className="relative px-3 sm:px-6 lg:px-8 pt-3 pb-8 sm:py-6 max-w-7xl mx-auto w-full">
        <HeroVideoShowcase />
      </section>

      {/* 4. Trending Now Collection Grid (Nothing OS Dot-Matrix Header + Exact Pixel Alignments) */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#e6e2d8]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#b91c1c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]" />
              <span>POPULAR DEMAND // REAL-TIME DISPATCH</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-ndot font-bold text-stone-950 tracking-wider mt-1">
              TRENDING JEWELLERY RIGHT NOW
            </h2>
          </div>
          <Link
            href="/shop?sort=trending"
            className="font-mono text-xs font-bold text-stone-600 hover:text-[#b91c1c] flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            VIEW ALL [ {trendingProducts.length} ] <ChevronRight className="w-4 h-4 text-[#b91c1c]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 items-stretch">
          {(trendingProducts.length > 0 ? trendingProducts : allProducts.slice(0, 4)).map((product: any) => {
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
                isTrending={product.isTrending}
                isBestseller={product.isBestseller}
              />
            );
          })}
        </div>
      </section>

      {/* 5. Split Feature Banners */}
      <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Banner 1: Jaipur Kundan & Polki */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] border border-stone-200 bg-stone-900 shadow-md group">
            <img
              src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1000&q=80"
              alt="Jaipur Kundan Chokers"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white font-mono">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-white/15 px-2 py-0.5 rounded">
                [ GUILD 01 // JOHARI BAZAAR JAIPUR ]
              </span>
              <h3 className="text-xl sm:text-2xl font-sans font-bold text-white">
                Handcrafted Kundan & Polki Sets
              </h3>
              <p className="text-xs text-stone-300 font-mono">
                Precision-cut Polki glass stones set in 22K micro gold plating with adjustable dori.
              </p>
              <Link
                href="/category/necklaces-chokers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-amber-300 uppercase tracking-wider pt-1 transition-colors"
              >
                <span>OPEN KUNDAN ARCHIVE →</span>
              </Link>
            </div>
          </div>

          {/* Banner 2: Rajkot Temple Kadas & Bangles */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] border border-stone-200 bg-stone-900 shadow-md group">
            <img
              src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80"
              alt="Rajkot Temple Bangles"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white font-mono">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-white/15 px-2 py-0.5 rounded">
                [ GUILD 02 // RAJKOT GOLDCRAFT ]
              </span>
              <h3 className="text-xl sm:text-2xl font-sans font-bold text-white">
                Rajwadi Kadas & Temple Bangles
              </h3>
              <p className="text-xs text-stone-300 font-mono">
                Intricate nakshi carving, openable clasps, and micro-plated matte finish.
              </p>
              <Link
                href="/category/bangles-kadas"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-amber-300 uppercase tracking-wider pt-1 transition-colors"
              >
                <span>OPEN BANGLES ARCHIVE →</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Technical Supply Chain Transparency Section (Creamy Luxury Cards with Mobile Swipe Carousel) */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full font-mono">
        <div className="rounded-3xl border border-[#e6e2d8] bg-white p-5 sm:p-10 space-y-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6e2d8] pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-[#b91c1c] font-bold uppercase tracking-widest">
                <Cpu className="w-3.5 h-3.5" />
                <span>JEWELLERY PROTOCOL</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-sans font-extrabold text-stone-950 tracking-tight mt-0.5 whitespace-nowrap">
                Why Direct From Karigars Matters
              </h2>
            </div>
            <p className="text-xs text-stone-500 max-w-md hidden sm:block">
              Zero retail middlemen markups. Direct jewellery guild payouts.
            </p>
          </div>

          {/* Mobile Horizontal Carousel */}
          <div className="flex overflow-x-auto pb-3 sm:pb-0 scrollbar-none snap-x snap-mandatory gap-4 md:grid md:grid-cols-4 relative -mx-2 px-2 sm:mx-0 sm:px-0">
            
            <div className="min-w-[240px] md:min-w-0 snap-center p-4 rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] space-y-2 shrink-0">
              <span className="text-[10px] text-stone-500 font-bold">[ 01 // BASE CRAFT ]</span>
              <p className="text-base font-bold text-stone-950">100% Pure Brass</p>
              <p className="text-xs text-stone-600">Hypoallergenic high-density eco brass. 100% Lead & Nickel free.</p>
            </div>

            <div className="min-w-[240px] md:min-w-0 snap-center p-4 rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] space-y-2 shrink-0">
              <span className="text-[10px] text-stone-500 font-bold">[ 02 // PLATING FINISH ]</span>
              <p className="text-base font-bold text-stone-950">22K Micro Plating</p>
              <p className="text-xs text-stone-600">Multi-layer lacquer coating protecting against oxidation & sweat.</p>
            </div>

            <div className="min-w-[240px] md:min-w-0 snap-center p-4 rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] space-y-2 shrink-0">
              <span className="text-[10px] text-stone-500 font-bold">[ 03 // SHOWROOM RENT ]</span>
              <p className="text-base font-bold text-[#b91c1c]">₹0 Retail Markup</p>
              <p className="text-xs text-stone-600">Zero mall showroom markups passed down. Save over ₹2,000 on bridal sets.</p>
            </div>

            <div className="min-w-[240px] md:min-w-0 snap-center p-4 rounded-2xl bg-[#faf8f5] border border-[#e6e2d8] space-y-2 shrink-0">
              <span className="text-[10px] text-stone-500 font-bold">[ 04 // LOGISTICS ]</span>
              <p className="text-base font-bold text-emerald-700">28,000+ PIN Codes</p>
              <p className="text-xs text-stone-600">Velvet gift box packaging with full Cash on Delivery protection.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Customer Presence Video Reviews (Placed cleanly after details and before remaining collection) */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-[#e6e2d8]">
        <CustomerVideoReviews />
      </section>

      {/* 8. All-Time Bestsellers Collection Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-[#e6e2d8]">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#e6e2d8]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#b91c1c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]" />
              <span>HIGH VOLUME FAVORITES</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-ndot font-bold text-stone-950 tracking-wider mt-1">
              ALL-TIME BESTSELLING JEWELLERY
            </h2>
          </div>
          <Link
            href="/shop?sort=bestseller"
            className="font-mono text-xs font-bold text-stone-600 hover:text-[#b91c1c] flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            VIEW ALL [ {bestsellers.length} ] <ChevronRight className="w-4 h-4 text-[#b91c1c]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 items-stretch">
          {(bestsellers.length > 0 ? bestsellers : allProducts).map((product: any) => {
            const avgRating =
              product.reviews && product.reviews.length > 0
                ? product.reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / product.reviews.length
                : 4.9;

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
                reviewCount={product.reviews.length || 54}
                isTrending={product.isTrending}
                isBestseller={product.isBestseller}
              />
            );
          })}
        </div>
      </section>

    </div>
  );
}

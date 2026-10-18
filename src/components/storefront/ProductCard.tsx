'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Check, ArrowRight, Heart } from 'lucide-react';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  regularPrice: number;
  sellingPrice: number;
  sku: string;
  brandName?: string | null;
  imageUrl?: string | null;
  rating?: number;
  reviewCount?: number;
  isBestseller?: boolean;
  isTrending?: boolean;
}

export default function ProductCard({
  id,
  title,
  slug,
  regularPrice,
  sellingPrice,
  sku,
  brandName,
  imageUrl,
  rating = 4.8,
  reviewCount = 38,
  isBestseller,
  isTrending,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const discount = calculateDiscount(regularPrice, sellingPrice);

  // Reliable, high-definition Indian luxury jewellery fallback image
  const primaryImage =
    imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(
      {
        productId: id,
        title,
        slug,
        image: primaryImage,
        sku,
        price: sellingPrice,
        regularPrice,
        quantity: 1,
      },
      true // Opens slide-out cart drawer
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#e6e2d8] hover:border-stone-400 transition-all duration-300 shadow-2xs hover:shadow-xl text-stone-900">
      
      {/* Product Image Stage */}
      <div className="relative aspect-[4/5] bg-[#f5f2eb] overflow-hidden">
        <Link href={`/product/${slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {discount > 0 && (
            <span className="bg-[#b91c1c] text-white font-mono font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              -{discount}%
            </span>
          )}
          {isBestseller && (
            <span className="bg-stone-950 text-white font-mono text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              BESTSELLER
            </span>
          )}
          {isTrending && !isBestseller && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-xs">
              HOT DROP
            </span>
          )}
        </div>

        {/* Top Right: Wishlist / Save Heart Button (Requested by user) */}
        <button
          type="button"
          onClick={handleToggleSave}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-xs hover:bg-white text-stone-700 transition-transform active:scale-90 cursor-pointer"
          title={isSaved ? "Remove from Saved" : "Save to Wishlist"}
          aria-label={isSaved ? "Remove from Saved" : "Save to Wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isSaved ? 'fill-red-600 text-red-600' : 'text-stone-600 hover:text-red-600'
            }`}
          />
        </button>

        {/* Desktop Action Dock (Appears on hover) */}
        <div className="hidden sm:flex absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-20 gap-2">
          <Link
            href={`/product/${slug}`}
            className="flex-1 py-2 px-2 rounded-xl bg-white/95 backdrop-blur-md border border-stone-300 hover:border-stone-900 text-stone-900 font-mono font-bold text-[11px] shadow-md hover:bg-stone-950 hover:text-white transition-all flex items-center justify-center gap-1 active:scale-95 text-center"
            title="View Full Product Specifications"
          >
            <span>DETAILS</span>
            <ArrowRight className="w-3 h-3 text-[#b91c1c]" />
          </Link>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={added}
            className="flex-1 py-2 px-2 rounded-xl bg-stone-950 hover:bg-[#b91c1c] text-white font-mono font-bold text-[11px] shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-80"
            title="Quick Add to Bag"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>ADDED!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ BAG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Information Container with Strict Alignment */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between space-y-2 bg-white">
        <div>
          {/* Brand & Star Rating in single row */}
          <div className="flex items-center justify-between font-mono text-[10px] text-stone-500 mb-1">
            <span className="uppercase font-bold tracking-wider truncate max-w-[110px]">
              {brandName || 'FASHION ATELIER'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span className="text-stone-800 font-bold">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title with Fixed Min-Height for Strict Grid Alignment */}
          <Link href={`/product/${slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#b91c1c] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* Pixel-Perfect Price & Action Baseline */}
        <div className="pt-2 border-t border-[#e6e2d8]/70 mt-auto flex items-center justify-between font-mono gap-1">
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-sm sm:text-base font-bold text-stone-950 tracking-tight">
              {formatPrice(sellingPrice)}
            </span>
            {regularPrice > sellingPrice && (
              <span className="text-[10px] sm:text-[11px] text-stone-400 line-through truncate">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile quick add button: Easy 1-tap on touch screens */}
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={added}
              className="sm:hidden px-2.5 py-1.5 rounded-lg bg-stone-900 text-white font-mono text-[10px] font-bold active:scale-95 transition-all flex items-center gap-1 shadow-2xs"
              aria-label="Add to bag"
              title="Add to bag"
            >
              {added ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>+ BAG</span>
                </>
              )}
            </button>
            <span className="hidden sm:inline font-mono text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
              ● FREE SHIP
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

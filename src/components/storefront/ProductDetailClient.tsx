'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  MapPin, 
  Share2, 
  ChevronRight, 
  ChevronDown, 
  Cpu, 
  Copy, 
  MessageCircle, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import ProductCard from '@/components/storefront/ProductCard';

export interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    specifications?: string | null;
    sku: string;
    regularPrice: number;
    sellingPrice: number;
    stock: number;
    brand?: { name: string; slug: string } | null;
    category?: { name: string; slug: string } | null;
    images: { id: string; url: string; altText?: string | null }[];
    variants: {
      id: string;
      sku: string;
      title: string;
      size?: string | null;
      color?: string | null;
      colorHex?: string | null;
      price?: number | null;
      stock: number;
    }[];
    reviews: {
      id: string;
      customerName: string;
      rating: number;
      title?: string | null;
      comment: string;
      verifiedPurchase: boolean;
      createdAt: string | Date;
    }[];
  };
  relatedProducts?: {
    id: string;
    title: string;
    slug: string;
    regularPrice: number;
    sellingPrice: number;
    sku: string;
    brand?: { name: string } | null;
    images: { url: string }[];
    reviews: { rating: number }[];
    isBestseller?: boolean;
    isTrending?: boolean;
  }[];
}

export default function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();

  // Gallery state
  const images = product.images.length > 0
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || null;

  // Active pricing and stock
  const activePrice = selectedVariant?.price || product.sellingPrice;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;
  const activeSku = selectedVariant ? selectedVariant.sku : product.sku;
  const discount = calculateDiscount(product.regularPrice, activePrice);

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Accordions
  const [openTab, setOpenTab] = useState<'desc' | 'specs' | 'shipping'>('desc');

  // PIN code checker state
  const [pincode, setPincode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinResult, setPinResult] = useState<{
    serviceable: boolean;
    city?: string;
    estimatedDelivery?: string;
    message?: string;
  } | null>(null);

  // Share link feedback
  const [linkCopied, setLinkCopied] = useState(false);

  // Reviews calculation & interactive review submission state
  const [reviewsList, setReviewsList] = useState(product.reviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const totalReviews = reviewsList.length;
  const avgRating =
    totalReviews > 0
      ? reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 4.9;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewErrorMsg('Please enter your name and review comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewName.trim(),
          rating: reviewRating,
          title: reviewTitle.trim() || `${reviewRating}-Star Verified Review`,
          comment: reviewComment.trim(),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setReviewsList((prev) => [created, ...prev]);
        setReviewSuccessMsg('✨ Thank you! Your verified customer review has been published.');
        setReviewName('');
        setReviewTitle('');
        setReviewComment('');
        setReviewRating(5);
        setTimeout(() => {
          setShowReviewForm(false);
          setReviewSuccessMsg('');
        }, 2500);
      } else {
        const err = await res.json();
        setReviewErrorMsg(err.error || 'Failed to submit review.');
      }
    } catch {
      setReviewErrorMsg('Network error. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length !== 6) return;

    setPinLoading(true);
    try {
      const res = await fetch('/api/shipping/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pincode.trim() }),
      });
      const data = await res.json();
      setPinResult(data);
    } catch {
      setPinResult({ serviceable: false, message: 'Could not connect to shipping service' });
    } finally {
      setPinLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      title: product.title,
      slug: product.slug,
      image: images[0],
      sku: activeSku,
      size: selectedVariant?.size || null,
      color: selectedVariant?.color || null,
      price: activePrice,
      regularPrice: product.regularPrice,
      quantity,
    }, true); // Auto opens cart drawer
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      title: product.title,
      slug: product.slug,
      image: images[0],
      sku: activeSku,
      size: selectedVariant?.size || null,
      color: selectedVariant?.color || null,
      price: activePrice,
      regularPrice: product.regularPrice,
      quantity,
    }, false);
    router.push('/checkout');
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out this authentic artisan product: ${product.title} at factory direct price ₹${(activePrice / 100).toFixed(0)} on ShopHaven!`);
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-[#141416]">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 font-mono text-xs text-stone-500 mb-6 truncate">
        <Link href="/" className="hover:text-stone-900 transition-colors">HOME</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-stone-900 transition-colors uppercase">
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </>
        )}
        <span className="text-stone-900 font-bold truncate max-w-sm uppercase">{product.title}</span>
      </nav>

      {/* Main 2-Column Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        
        {/* Left Column: Product Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          
          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 pb-2 md:pb-0 scrollbar-none">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#b91c1c] shadow-md ring-2 ring-[#b91c1c]/20'
                      : 'border-[#e6e2d8] hover:border-stone-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image Preview */}
          <div className="relative flex-1 aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-[#e6e2d8] shadow-md dot-matrix group">
            <img
              src={images[selectedImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
              }}
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-[#b91c1c] text-white font-mono font-bold text-xs px-3 py-1 rounded-xl shadow-md uppercase tracking-wider">
                SAVE {discount}%
              </span>
            )}
            <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-stone-700 border border-[#e6e2d8] font-mono text-[10px] px-2.5 py-1 rounded-xl uppercase font-bold shadow-xs">
              ROYAL ATELIER DIRECT
            </span>
          </div>
        </div>

        {/* Right Column: Sticky Buy Box & Controls */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="uppercase font-bold tracking-widest text-[#b91c1c] bg-[#faf8f5] border border-[#e6e2d8] px-2.5 py-0.5 rounded-lg">
                [ {product.brand?.name || 'ROYAL KARIGAR ATELIER'} ]
              </span>
              <span className="text-stone-500">REF: {activeSku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-stone-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating Stars & Social Share Row */}
            <div className="flex items-center justify-between pt-1 font-mono text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="font-bold text-stone-900">{avgRating.toFixed(1)}</span>
                <span className="text-stone-300">•</span>
                <a
                  href="#customer-reviews"
                  onClick={() => setShowReviewForm(true)}
                  className="text-stone-600 underline hover:text-[#b91c1c] transition-colors cursor-pointer"
                >
                  {totalReviews} Verified Reviews
                </a>
              </div>

              {/* Share Controls (WhatsApp & Link) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 rounded-lg bg-[#faf8f5] border border-[#e6e2d8] text-stone-600 hover:text-stone-900 hover:bg-[#f5f2eb] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Copy Product Link"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#e6e2d8] shadow-xs space-y-1.5 font-mono">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
                {formatPrice(activePrice)}
              </span>
              {product.regularPrice > activePrice && (
                <span className="text-base text-stone-400 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Save {formatPrice(product.regularPrice - activePrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              All taxes included. Free express dispatch on orders above ₹499.
            </p>
          </div>

          {/* Stock Urgency Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-800">
            <span className="w-2 h-2 rounded-full bg-[#b91c1c] glyph-pulse" />
            {activeStock > 0 ? (
              <span>
                ONLY <strong className="text-[#b91c1c]">{activeStock} UNITS</strong> READY AT DIRECT GUILD RATE
              </span>
            ) : (
              <span className="text-red-600">Currently Sold Out</span>
            )}
          </div>

          {/* Interactive Color Variant Selector */}
          {product.variants.some((v) => v.colorHex || v.color) && (
            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 uppercase tracking-wider font-semibold">SELECT COLOR / SHADE:</span>
                {selectedVariant?.color && (
                  <span className="text-stone-900 font-bold">{selectedVariant.color}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-[#e6e2d8] bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900'
                      }`}
                    >
                      {v.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <span>{v.color || v.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size / Edition Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2 font-mono">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                SELECT EDITION / SIZE:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedVariantId === v.id
                        ? 'border-[#b91c1c] bg-[#b91c1c]/10 text-[#b91c1c] shadow-xs ring-1 ring-[#b91c1c]'
                        : 'border-[#e6e2d8] bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900'
                    }`}
                  >
                    {v.size || v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2 font-mono">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-stone-500">QUANTITY</span>
              <div className="inline-flex items-center rounded-xl border border-[#e6e2d8] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-[#faf8f5] rounded-lg transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-extrabold text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(activeStock || 10, q + 1))}
                  className="px-3 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-[#faf8f5] rounded-lg transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={activeStock <= 0}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO SHOPPING BAG</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={activeStock <= 0}
                className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>INSTANT 1-CLICK CHECKOUT (COD / UPI)</span>
              </button>
            </div>
          </div>

          {/* Delivery PIN Code Checker */}
          <div className="p-4 rounded-2xl border border-[#e6e2d8] bg-white space-y-3 font-mono shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <MapPin className="w-4 h-4 text-[#b91c1c]" />
              <span>PIN CODE TELEMETRY & DISPATCH TIME</span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 bg-[#faf8f5] border border-[#e6e2d8] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"
              />
              <button
                type="submit"
                disabled={pinLoading || pincode.trim().length !== 6}
                className="px-5 py-2 bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {pinLoading ? '...' : 'Check'}
              </button>
            </form>

            {pinResult && (
              <div
                className={`text-xs p-3 rounded-xl border flex items-start gap-2.5 ${
                  pinResult.serviceable
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">{pinResult.message}</p>
                  {pinResult.estimatedDelivery && (
                    <p className="text-[11px] text-emerald-700">{pinResult.estimatedDelivery}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hardware & Spec Accordions */}
          <div className="pt-2 border-t border-[#e6e2d8] divide-y divide-[#e6e2d8] text-xs font-mono">
            {/* Description Tab */}
            <div className="py-3">
              <button
                onClick={() => setOpenTab(openTab === 'desc' ? ('' as any) : 'desc')}
                className="w-full flex items-center justify-between font-bold text-stone-900 hover:text-[#b91c1c] transition-colors cursor-pointer"
              >
                <span>[ 01 // JEWELLERY CRAFTSMANSHIP & DETAILS ]</span>
                <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openTab === 'desc' ? 'rotate-180' : ''}`} />
              </button>
              {openTab === 'desc' && (
                <p className="mt-2 text-stone-600 leading-relaxed whitespace-pre-line pt-1">
                  {product.description}
                </p>
              )}
            </div>

            {/* Specs Tab */}
            {product.specifications && (
              <div className="py-3">
                <button
                  onClick={() => setOpenTab(openTab === 'specs' ? ('' as any) : 'specs')}
                  className="w-full flex items-center justify-between font-bold text-stone-900 hover:text-[#b91c1c] transition-colors cursor-pointer"
                >
                  <span>[ 02 // METAL PURITY & SPECIFICATIONS ]</span>
                  <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openTab === 'specs' ? 'rotate-180' : ''}`} />
                </button>
                {openTab === 'specs' && (
                  <div className="mt-2 space-y-1.5 bg-[#faf8f5] p-3 rounded-xl text-stone-700 border border-[#e6e2d8]">
                    {product.specifications.split('|').map((spec, i) => (
                      <div key={i} className="py-0.5 border-b border-[#e6e2d8] last:border-0 font-medium">
                        {spec.trim()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shipping & Delivery Tab */}
            <div className="py-3">
              <button
                onClick={() => setOpenTab(openTab === 'shipping' ? ('' as any) : 'shipping')}
                className="w-full flex items-center justify-between font-bold text-stone-900 hover:text-[#b91c1c] transition-colors cursor-pointer"
              >
                <span>[ 03 // DISPATCH & RETURN LOGISTICS ]</span>
                <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openTab === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              {openTab === 'shipping' && (
                <div className="mt-2 text-stone-600 space-y-1 pt-1 leading-relaxed">
                  <p>• Dispatched in protective velvet jewelry casing within 24 hours.</p>
                  <p>• Express air logistics to 28,000+ PIN codes across India.</p>
                  <p>• 7-day hassle-free doorstep return & exchange with complete Cash on Delivery verification.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Suggested / Recommended Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#e6e2d8] font-mono">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-[#e6e2d8]">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-[#b91c1c] font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CURATED ATELIER RECOMMENDATIONS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-stone-900 mt-1">
                You May Also Adore
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-stone-500 hover:text-stone-900 uppercase tracking-wider"
            >
              EXPLORE ALL →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rp) => {
              const avg = rp.reviews.length > 0
                ? rp.reviews.reduce((acc, r) => acc + r.rating, 0) / rp.reviews.length
                : 4.8;
              return (
                <ProductCard
                  key={rp.id}
                  id={rp.id}
                  title={rp.title}
                  slug={rp.slug}
                  regularPrice={rp.regularPrice}
                  sellingPrice={rp.sellingPrice}
                  sku={rp.sku}
                  brandName={rp.brand?.name}
                  imageUrl={rp.images[0]?.url}
                  rating={avg}
                  reviewCount={rp.reviews.length || 24}
                  isBestseller={rp.isBestseller}
                  isTrending={rp.isTrending}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Verified Reviews Section with Interactive Customer Review Form */}
      <section id="customer-reviews" className="mt-16 pt-12 border-t border-[#e6e2d8] font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#e6e2d8]">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-[#b91c1c] font-bold uppercase tracking-widest">
              <Cpu className="w-3.5 h-3.5" />
              <span>BUYER TELEMETRY &amp; VERIFIED REVIEWS</span>
            </div>
            <h2 className="text-2xl font-sans font-extrabold text-stone-900 mt-1">
              Customer Feedback ({totalReviews})
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-xs text-stone-900">{avgRating.toFixed(1)} out of 5</span>
              <span className="text-stone-400 text-xs">• Based on {totalReviews} buyer ratings</span>
            </div>
          </div>

          {/* Write a Review Button */}
          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2.5 rounded-xl bg-stone-950 hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{showReviewForm ? 'Cancel Review' : 'Write a Customer Review'}</span>
          </button>
        </div>

        {/* Collapsible Customer Review Submission Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="mb-8 p-5 sm:p-6 rounded-2xl bg-white border-2 border-stone-900 shadow-md space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-sm text-stone-900 uppercase">
                [ Share Your Jewellery Experience ]
              </h3>
              <span className="text-[10px] text-stone-500 font-bold">100% Verified Buyer Badge</span>
            </div>

            {reviewSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {reviewSuccessMsg}
              </div>
            )}

            {reviewErrorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                {reviewErrorMsg}
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block uppercase">
                Overall Rating: <span className="text-amber-600">{reviewHoverRating || reviewRating} / 5 Stars</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setReviewHoverRating(star)}
                    onMouseLeave={() => setReviewHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (reviewHoverRating || reviewRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavita Sundaram"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">Review Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Stunning polish, feels like real gold!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">Detailed Review / Feedback *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the shine, weight, packaging, skin comfort, and finish of this jewellery piece..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-900 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 rounded-xl bg-stone-950 hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {submittingReview ? 'Submitting...' : 'Post Customer Review'}
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviewsList.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-[#e6e2d8] p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-900">{r.customerName}</span>
                  {r.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      <Check className="w-3 h-3" /> VERIFIED BUYER
                    </span>
                  )}
                </div>
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
              </div>
              {r.title && <h4 className="text-xs font-bold text-stone-900">{r.title}</h4>}
              <p className="text-xs text-stone-600 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Mobile Add-to-Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e6e2d8] p-3 flex items-center justify-between gap-3 shadow-2xl font-mono">
        <div>
          <span className="text-[10px] text-stone-400 line-through block leading-none">
            {product.regularPrice > activePrice && formatPrice(product.regularPrice)}
          </span>
          <div className="text-base font-extrabold text-stone-900 leading-tight">
            {formatPrice(activePrice)}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2.5 px-3 bg-stone-900 text-white hover:bg-stone-800 font-bold text-xs rounded-xl uppercase transition-colors"
          >
            + BAG
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-2.5 px-3 bg-[#b91c1c] text-white hover:bg-[#991b1b] font-bold text-xs rounded-xl uppercase transition-colors"
          >
            BUY NOW
          </button>
        </div>
      </div>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ShoppingBag, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  ArrowRight, 
  MapPin, 
  Zap,
  ExternalLink,
  Loader2,
  Layers,
  Sparkles
} from 'lucide-react';
import { useQuickView, QuickViewProductData } from '@/context/QuickViewContext';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateDiscount } from '@/lib/utils';

export default function QuickViewModal() {
  const router = useRouter();
  const { isOpen, activeProductId, initialData, closeQuickView } = useQuickView();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<QuickViewProductData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Pin check state
  const [pincode, setPincode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  // Fetch full details if only partial data was provided
  useEffect(() => {
    if (!isOpen || !activeProductId) {
      setProduct(null);
      return;
    }

    if (initialData) {
      setProduct(initialData);
      setSelectedImage(
        initialData.imageUrl ||
        initialData.images?.[0]?.url ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      );
      if (initialData.variants && initialData.variants.length > 0) {
        setSelectedVariantId(initialData.variants[0].id);
      }
    }

    // Always fetch latest data from API to ensure variants and specs are rich
    const fetchFullData = async () => {
      setLoading(!initialData);
      try {
        const res = await fetch(`/api/products/${activeProductId}/quick-view`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (!initialData || !selectedImage) {
            setSelectedImage(data.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');
          }
          if (data.variants && data.variants.length > 0 && !selectedVariantId) {
            setSelectedVariantId(data.variants[0].id);
          }
        }
      } catch (err) {
        console.error('Quick view fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
    setQuantity(1);
    setAdded(false);
    setPinMessage(null);
  }, [isOpen, activeProductId, initialData]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeQuickView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeQuickView]);

  if (!isOpen) return null;

  // Selected variant calculations
  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId) || null;
  const activePrice = selectedVariant?.price || product?.sellingPrice || 0;
  const regularPrice = product?.regularPrice || activePrice;
  const discount = calculateDiscount(regularPrice, activePrice);
  const activeStock = selectedVariant ? selectedVariant.stock : (product?.stock ?? 10);
  const sku = selectedVariant ? selectedVariant.sku : (product?.sku || 'SH-TECH-01');

  const galleryImages = product?.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : [product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!product) return;

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        title: product.title,
        slug: product.slug,
        image: selectedImage || galleryImages[0],
        sku,
        price: activePrice,
        regularPrice,
        size: selectedVariant?.size || undefined,
        color: selectedVariant?.color || undefined,
        quantity,
      },
      true // Auto opens cart drawer
    );

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      closeQuickView();
    }, 800);
  };

  const handleInstantBuy = () => {
    handleAddToCart();
    closeQuickView();
    router.push('/checkout');
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setPinLoading(true);
    try {
      const res = await fetch('/api/shipping/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode }),
      });
      const data = await res.json();
      if (data.serviceable) {
        setPinMessage(`● Express Delivery to ${data.city || 'your area'} by ${data.estimatedDelivery || '2-4 business days'}. COD Available.`);
      } else {
        setPinMessage('Delivery not available for this PIN code.');
      }
    } catch {
      setPinMessage('● Standard Delivery available (3-5 business days).');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={closeQuickView} />

      {/* Main Modal Window */}
      <div className="relative w-full max-w-4xl bg-white border border-[#e6e2d8] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 text-[#141416] my-auto">
        
        {/* Top Technical Status Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#e6e2d8] bg-[#faf8f5] flex items-center justify-between font-mono text-[11px] text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#b91c1c] glyph-pulse" />
            <span className="font-bold text-stone-900 tracking-widest uppercase">
              QUICK PRODUCT SPECIFICATION
            </span>
            <span className="hidden sm:inline text-stone-300">|</span>
            <span className="hidden sm:inline text-stone-500">
              REF: [ {sku} ]
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[10px] text-stone-400 border border-[#e6e2d8] px-1.5 py-0.5 rounded">
              ESC TO CLOSE
            </span>
            <button
              onClick={closeQuickView}
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              aria-label="Close Quick Details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {loading && !product ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#b91c1c] animate-spin" />
            <span className="font-mono text-xs text-stone-500 tracking-widest uppercase">
              Loading Product Specifications...
            </span>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[80vh] overflow-y-auto">
            
            {/* Left Column: Image Stage & Thumbnails (5 cols) */}
            <div className="md:col-span-5 p-4 sm:p-6 bg-[#faf8f5] border-b md:border-b-0 md:border-r border-[#e6e2d8] flex flex-col justify-between space-y-4">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#e6e2d8] bg-white dot-matrix group">
                <img
                  src={selectedImage || galleryImages[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                  {discount > 0 && (
                    <span className="bg-[#b91c1c] text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                      -{discount}% OFF
                    </span>
                  )}
                  <span className="bg-white/95 backdrop-blur-md text-stone-700 border border-[#e6e2d8] font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold shadow-xs">
                    Direct Artisan
                  </span>
                </div>
              </div>

              {/* Thumbnails strip */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                        selectedImage === img
                          ? 'border-[#b91c1c] ring-1 ring-[#b91c1c]'
                          : 'border-[#e6e2d8] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Artisan Authenticity Pill */}
              <div className="p-3 rounded-xl bg-white border border-[#e6e2d8] font-mono text-[11px] text-stone-600 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#b91c1c]" />
                  <span>GUILD VERIFIED // 100% PURE</span>
                </div>
                <span className="text-stone-900 font-bold">COD READY</span>
              </div>
            </div>

            {/* Right Column: Technical Spec & Action Panel (7 cols) */}
            <div className="md:col-span-7 p-4 sm:p-6 space-y-4 bg-white flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Brand & Reviews */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#b91c1c] font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-[#faf8f5] border border-[#e6e2d8]">
                    [ {product.brand?.name || 'DIRECT WEAVER'} ]
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-stone-900">{product.rating || 4.8}</span>
                    <span className="text-stone-400">({product.reviewCount || 42} reviews)</span>
                  </div>
                </div>

                {/* Product Title */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-snug">
                    {product.title}
                  </h2>
                  {product.shortDescription && (
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                </div>

                {/* Price Display */}
                <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] flex items-baseline justify-between shadow-xs">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
                      {formatPrice(activePrice)}
                    </span>
                    {regularPrice > activePrice && (
                      <span className="text-sm font-mono text-stone-400 line-through">
                        {formatPrice(regularPrice)}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Save {formatPrice(regularPrice - activePrice)}
                  </span>
                </div>

                {/* Variant Options: Sizes / Colors */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-500 uppercase tracking-wider font-semibold">SELECT SPEC // VARIANT:</span>
                      {selectedVariant && (
                        <span className="text-stone-900 font-bold">{selectedVariant.title}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => {
                        const isSelected = variant.id === selectedVariantId;
                        return (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariantId(variant.id)}
                            className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-xs'
                                : 'bg-[#faf8f5] text-stone-700 border-[#e6e2d8] hover:border-stone-900 hover:text-stone-900'
                            }`}
                          >
                            {variant.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-stone-300"
                                style={{ backgroundColor: variant.colorHex }}
                              />
                            )}
                            <span>{variant.size || variant.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Technical Specifications Matrix */}
                <div className="rounded-xl border border-[#e6e2d8] bg-[#faf8f5] p-3 text-xs space-y-2 font-mono">
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider flex items-center justify-between border-b border-[#e6e2d8] pb-1.5 font-bold">
                    <span>HARDWARE & FABRIC METRICS</span>
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {activeStock > 0 ? `${activeStock} UNITS AVAILABLE` : 'OUT OF STOCK'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-stone-500">CATEGORY:</span>{' '}
                      <span className="text-stone-900 font-semibold">{product.category?.name || 'Ethnic Textile'}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">SOURCED FROM:</span>{' '}
                      <span className="text-stone-900 font-semibold">{product.supplier?.name || product.supplier?.address || 'Surat Direct Guild'}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">QUALITY GRADE:</span>{' '}
                      <span className="text-stone-900 font-semibold">A+ Export Standard</span>
                    </div>
                    <div>
                      <span className="text-stone-500">DISPATCH SPEED:</span>{' '}
                      <span className="text-[#b91c1c] font-semibold">Within 24 Hours</span>
                    </div>
                  </div>
                </div>

                {/* Quick PIN Code Check */}
                <form onSubmit={handleCheckPincode} className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN code..."
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-lg px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 font-mono focus:outline-none focus:border-stone-900"
                      />
                      <MapPin className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    <button
                      type="submit"
                      disabled={pinLoading || pincode.length !== 6}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer"
                    >
                      {pinLoading ? '...' : 'Check'}
                    </button>
                  </div>
                  {pinMessage && (
                    <p className="text-[10px] font-mono text-emerald-700">
                      {pinMessage}
                    </p>
                  )}
                </form>

              </div>

              {/* Quantity & CTA Buttons */}
              <div className="pt-4 border-t border-[#e6e2d8] space-y-3">
                
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#e6e2d8] rounded-xl bg-[#faf8f5] p-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-[#e6e2d8] rounded-lg transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-[#e6e2d8] rounded-lg transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Primary Add To Bag */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={activeStock <= 0}
                    className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>ADDED TO BAG!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ADD TO BAG // {formatPrice(activePrice * quantity)}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Instant 1-Click Buy Now */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInstantBuy}
                    disabled={activeStock <= 0}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>1-CLICK EXPRESS CHECKOUT</span>
                  </button>

                  <Link
                    href={`/product/${product.slug}`}
                    onClick={closeQuickView}
                    className="p-2.5 rounded-xl border border-[#e6e2d8] hover:border-stone-900 text-stone-600 hover:text-stone-900 bg-[#faf8f5] transition-all flex items-center justify-center"
                    title="View Full Product Page & Reviews"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}

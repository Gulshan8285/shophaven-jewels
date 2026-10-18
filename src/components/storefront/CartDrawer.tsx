'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Tag, 
  Loader2 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const router = useRouter();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    subtotal, 
    finalTotal, 
    itemCount, 
    isCartDrawerOpen, 
    closeCartDrawer,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = 49900; // ₹499 in paise
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    closeCartDrawer();
    router.push('/checkout');
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setPromoLoading(true);
    setPromoError('');
    const res = await applyCoupon(promoInput.trim());
    setPromoLoading(false);
    if (!res.success) {
      setPromoError(res.message || 'Invalid coupon code');
    } else {
      setPromoInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#faf8f5] border-l border-[#e6e2d8] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-stone-900">
          
          {/* Drawer Top Header */}
          <div className="p-4 sm:p-5 border-b border-[#e6e2d8] flex items-center justify-between bg-[#f4f1ea] font-mono">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#b91c1c] glyph-pulse" />
              <h2 className="font-bold text-sm tracking-tight text-stone-950 uppercase">
                SHOPPING BAG // [ {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} ]
              </h2>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-1.5 rounded-lg hover:bg-stone-200/80 text-stone-500 hover:text-stone-950 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="p-4 bg-stone-900 text-stone-200 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-400 font-bold">● FREE EXPRESS SHIPPING UNLOCKED</span>
                ) : (
                  <span className="text-stone-300">
                    ADD <strong className="text-white">{formatPrice(amountNeeded)}</strong> FOR FREE DISPATCH
                  </span>
                )}
              </div>
              <span className="text-white font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-[#e6e2d8]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16 font-mono">
                <div className="w-16 h-16 rounded-2xl bg-[#f4f1ea] border border-[#e6e2d8] text-stone-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-stone-900 uppercase">[ BAG IS EMPTY ]</h3>
                  <p className="text-xs text-stone-500">Explore authentic weaver & factory collections</p>
                </div>
                <button
                  onClick={closeCartDrawer}
                  className="px-6 py-2.5 rounded-full bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-[#b91c1c] transition-all cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemKey = `${item.productId}-${item.variantId || 'default'}`;
                return (
                  <div key={itemKey} className="pt-4 first:pt-0 flex gap-3.5 group">
                    {/* Item Image */}
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCartDrawer}
                      className="relative w-20 h-24 rounded-xl overflow-hidden bg-stone-100 border border-[#e6e2d8] shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCartDrawer}
                            className="text-xs font-bold text-stone-900 hover:text-[#b91c1c] transition-colors line-clamp-2 leading-snug"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="text-stone-400 hover:text-[#b91c1c] p-1 transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1 font-mono text-[10px] text-stone-600">
                          {item.size && (
                            <span className="bg-[#f4f1ea] border border-[#e6e2d8] px-1.5 py-0.5 rounded font-semibold">
                              SIZE: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-[#f4f1ea] border border-[#e6e2d8] px-1.5 py-0.5 rounded font-semibold">
                              COLOR: {item.color}
                            </span>
                          )}
                          <span className="text-stone-400 border border-stone-200 px-1 py-0.5 rounded">
                            {item.sku}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between pt-2 font-mono">
                        <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-xs overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeItem(item.productId, item.variantId);
                              } else {
                                updateQuantity(item.productId, item.quantity - 1, item.variantId);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer text-sm font-bold active:scale-95"
                            title={item.quantity <= 1 ? "Remove from bag" : "Decrease quantity"}
                            aria-label={item.quantity <= 1 ? "Remove from bag" : "Decrease quantity"}
                          >
                            {item.quantity <= 1 ? '✕' : '−'}
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-stone-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors cursor-pointer text-sm font-bold active:scale-95"
                            title="Increase quantity"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-stone-950">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.regularPrice && item.regularPrice > item.price && (
                            <span className="block text-[10px] text-stone-400 line-through">
                              {formatPrice(item.regularPrice * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Bottom Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#e6e2d8] bg-[#f4f1ea] space-y-3.5 font-mono">
              
              {/* Promo Code Input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-bold text-emerald-800">{appliedCoupon.code} applied</span>
                    <span className="text-[10px] text-emerald-700">(-{formatPrice(appliedCoupon.discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[10px] text-stone-500 hover:text-stone-900 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon: FIRST100 or FESTIVE15"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 uppercase focus:outline-none focus:border-stone-900 shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-3.5 py-1.5 bg-stone-950 hover:bg-[#b91c1c] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[10px] text-red-600">{promoError}</p>
                  )}
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span className="text-stone-950 font-bold">{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>COUPON DISCOUNT</span>
                    <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>EXPRESS DISPATCH</span>
                  <span className="text-stone-900">
                    {subtotal >= freeShippingThreshold ? (
                      <strong className="text-emerald-700 font-bold">FREE</strong>
                    ) : (
                      formatPrice(7000)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-950">
                  <span>TOTAL ESTIMATED</span>
                  <span className="text-base text-stone-950">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-xl bg-stone-950 hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>PROCEED TO SECURE CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Security Marks */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#b91c1c]" /> 256-BIT ENCRYPTION
                </span>
                <span>•</span>
                <span>COD VERIFIED</span>
                <span>•</span>
                <span>7-DAY RETURNS</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

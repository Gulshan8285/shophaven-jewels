'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Check, 
  X,
  Truck
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingFee,
    finalTotal,
    itemCount,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const freeShippingThreshold = 49900; // ₹499 in paise
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
    setCouponLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-stone-200 p-10 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-stone-900">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Looks like you haven&apos;t added any items yet. Explore direct manufacturer offers and festive deals now!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs shadow-md transition-all"
          >
            Start Shopping Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Prices and delivery charges confirmed at checkout
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center gap-1"
        >
          Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Free Shipping Progress Meter */}
      <div className="my-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-800">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-600" />
            {subtotal >= freeShippingThreshold ? (
              <span className="text-emerald-800 font-bold">🎉 Congratulations! You have unlocked FREE Express Delivery!</span>
            ) : (
              <span>
                Add <span className="text-red-800 font-extrabold">{formatPrice(amountNeededForFreeShipping)}</span> more for FREE Delivery!
              </span>
            )}
          </div>
          <span className="text-stone-500">{progressToFreeShipping}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 transition-all duration-300"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Cart Layout: Items & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || 'base'}`}
              className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 flex gap-4 sm:gap-6 items-center shadow-2xs"
            >
              <div className="w-20 sm:w-24 aspect-[4/5] rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="flex-1 space-y-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-xs sm:text-sm font-bold text-stone-900 hover:text-red-800 line-clamp-2"
                >
                  {item.title}
                </Link>

                <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                  {item.size && <span>Size: <strong className="text-stone-800">{item.size}</strong></span>}
                  {item.color && <span>• Color: <strong className="text-stone-800">{item.color}</strong></span>}
                  <span>• SKU: {item.sku}</span>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-sm sm:text-base font-extrabold text-stone-900">
                    {formatPrice(item.price)}
                  </span>
                  {item.regularPrice > item.price && (
                    <span className="text-xs text-stone-400 line-through">
                      {formatPrice(item.regularPrice)}
                    </span>
                  )}
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between pt-2">
                  <div className="inline-flex items-center rounded-lg border border-stone-300 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-stone-400 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Coupon Box */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-stone-800">
              <Tag className="w-4 h-4 text-amber-600" />
              <span>Apply Promo Code</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>{appliedCoupon.code}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Savings of {formatPrice(appliedCoupon.discountAmount)} applied
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-stone-400 hover:text-red-700"
                  aria-label="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. FIRST100)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-semibold uppercase focus:bg-white focus:outline-none focus:border-red-800"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>

                {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-700 font-medium">{couponSuccess}</p>}

                {/* Available Quick Suggestion */}
                <div className="pt-1 text-[11px] text-stone-500">
                  Try code <button type="button" onClick={() => setCouponInput('FIRST100')} className="font-mono font-bold text-red-800 underline">FIRST100</button> for ₹100 off on ₹499+
                </div>
              </form>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-stone-900 pb-2 border-b border-stone-100">
              Price Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>- {formatPrice(appliedCoupon.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Delivery Charges</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-700">FREE</span>
                ) : (
                  <span className="font-semibold text-stone-900">{formatPrice(shippingFee)}</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-extrabold text-stone-900">Total Payable</span>
                <p className="text-[10px] text-stone-500">Inclusive of all taxes</p>
              </div>
              <span className="text-xl font-extrabold text-stone-950">
                {formatPrice(finalTotal)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-sm shadow-md shadow-red-900/10 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe and Secure 256-bit SSL Checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

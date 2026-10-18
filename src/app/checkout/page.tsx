'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  Lock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, appliedCoupon, shippingFee, finalTotal, clearCart } = useCart();
  const { user } = useAuth();

  // Address form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    paymentMethod: 'COD', // 'COD' | 'ONLINE_RAZORPAY'
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill if logged-in customer has data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
      }));

      // Fetch saved address if available
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.addresses?.[0]) {
            const addr = data.user.addresses[0];
            setFormData((prev) => ({
              ...prev,
              fullName: addr.fullName || prev.fullName,
              phone: addr.phone || prev.phone,
              streetAddress: addr.streetAddress || prev.streetAddress,
              landmark: addr.landmark || prev.landmark,
              city: addr.city || prev.city,
              state: addr.state || prev.state,
              postalCode: addr.postalCode || prev.postalCode,
            }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Handle PIN code lookup for quick city/state autofill
  const handlePincodeBlur = async () => {
    if (formData.postalCode.length === 6) {
      try {
        const res = await fetch('/api/shipping/check-pincode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pincode: formData.postalCode }),
        });
        const data = await res.json();
        if (data.serviceable && data.city) {
          if (!formData.city) {
            setFormData((prev) => ({ ...prev, city: data.city }));
          }
        }
      } catch {}
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.streetAddress || !formData.postalCode) {
      setErrorMessage('Please fill in all mandatory address fields marked with *');
      return;
    }

    if (!/^\d{6}$/.test(formData.postalCode)) {
      setErrorMessage('Please enter a valid 6-digit PIN code');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          title: i.title,
          image: i.image,
        })),
        customerDetails: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          streetAddress: formData.streetAddress,
          landmark: formData.landmark,
          city: formData.city || 'Standard Metro',
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India',
        },
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        clearCart();
        router.push(`/order-success/${data.orderNumber}`);
      } else {
        setErrorMessage(data.error || 'Failed to place order. Please review your details.');
      }
    } catch {
      setErrorMessage('Network or server error while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-4">
        <h2 className="text-lg font-bold text-stone-900">Your cart is currently empty</h2>
        <Link href="/shop" className="inline-block px-5 py-2.5 bg-red-800 text-white rounded-lg text-xs font-bold">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Checkout Header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="w-4 h-4" /> Back to Bag
        </Link>
        <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>SSL 256-Bit Encrypted Secure Checkout</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section: Contact, Shipping & Payment */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Step 1: Customer Contact */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <span className="w-6 h-6 rounded-full bg-red-800 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="font-extrabold text-sm text-stone-900">Contact Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Full Name *</label>
                <Input
                  required
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Phone Number (+91) *</label>
                <Input
                  required
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Email Address (for order invoices & tracking) *</label>
                <Input
                  required
                  type="email"
                  name="email"
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Address */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <span className="w-6 h-6 rounded-full bg-red-800 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="font-extrabold text-sm text-stone-900">Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Flat / House No. / Building / Street Address *</label>
                <Input
                  required
                  name="streetAddress"
                  placeholder="e.g. Flat 402, Sunshine Heights, Linking Road"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Landmark (Optional)</label>
                <Input
                  name="landmark"
                  placeholder="e.g. Near National College"
                  value={formData.landmark}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">6-Digit PIN Code *</label>
                <Input
                  required
                  maxLength={6}
                  name="postalCode"
                  placeholder="e.g. 400050"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  onBlur={handlePincodeBlur}
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">City / Town *</label>
                <Input
                  required
                  name="city"
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-800"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <span className="w-6 h-6 rounded-full bg-red-800 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h2 className="font-extrabold text-sm text-stone-900">Select Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'COD'
                    ? 'border-red-800 bg-red-50/40 ring-1 ring-red-800'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleInputChange}
                  className="mt-1 text-red-800 focus:ring-red-800"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-xs text-stone-900">Cash on Delivery (COD)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Zero Advance
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Pay cash or UPI (GPay/PhonePe) directly to the delivery courier when your parcel arrives.
                  </p>
                </div>
              </label>

              {/* Option 2: Online Payment / Razorpay */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'ONLINE_RAZORPAY'
                    ? 'border-red-800 bg-red-50/40 ring-1 ring-red-800'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE_RAZORPAY"
                  checked={formData.paymentMethod === 'ONLINE_RAZORPAY'}
                  onChange={handleInputChange}
                  className="mt-1 text-red-800 focus:ring-red-800"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-stone-800" />
                    <span className="font-bold text-xs text-stone-900">
                      Online Payment (UPI, Cards, Netbanking)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Pay securely using Google Pay, PhonePe, Paytm, Visa/RuPay Debit & Credit Cards.
                  </p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Section: Order Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-stone-900 pb-2 border-b border-stone-100">
              Order Items ({items.length})
            </h3>

            {/* Small list of items */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-14 object-cover rounded-md bg-stone-100 shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-stone-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-stone-500">Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}</p>
                    <p className="font-bold text-stone-800">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
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

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-stone-900">Total Payable</span>
                <span className="text-xl font-extrabold text-stone-950">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-red-800 hover:bg-red-900 text-white font-extrabold text-sm py-4 rounded-xl shadow-md"
            >
              {loading ? 'Processing Order...' : `Place Order • ${formatPrice(finalTotal)}`}
            </Button>

            <div className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>7-Day Doorstep Replacement Guarantee</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-800">Logistics & Dispatch</span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">Shipping & Delivery Policy</h1>
        <p className="text-xs text-stone-500 mt-1">Last revised: October 2026</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">1. Pan-India Delivery Network</h2>
          <p>
            ShopHaven partners with India’s leading logistics service providers, including Delhivery, BlueDart, Ekart, and Shadowfax, covering over 28,000+ PIN codes across urban and rural India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">2. Delivery Charges & Free Shipping</h2>
          <p>
            • Orders with a subtotal of <strong>₹499 or above</strong> qualify for <strong>100% FREE Standard Express Delivery</strong>.
          </p>
          <p>
            • For orders below ₹499, a nominal flat logistics contribution fee of <strong>₹49</strong> is applied at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">3. Estimated Timelines</h2>
          <p>
            • <strong>Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune):</strong> 2 to 3 business days.
          </p>
          <p>
            • <strong>Tier 2 & Tier 3 Towns:</strong> 3 to 5 business days.
          </p>
          <p>
            • <strong>North-East & Remote Regions:</strong> 5 to 7 business days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">4. Live Order Tracking</h2>
          <p>
            As soon as your parcel is packed and dispatched from our manufacturer fulfillment hub, you will receive an AWB tracking number. You can monitor your parcel journey in real-time at our <Link href="/track-order" className="text-red-800 font-bold underline">Track Order</Link> page.
          </p>
        </section>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, Check } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-800">Consumer Guarantee</span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">7-Day Return & Replacement Policy</h1>
        <p className="text-xs text-stone-500 mt-1">Hassle-free doorstep pickup across India</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">1. 7-Day Doorstep Returns</h2>
          <p>
            At ShopHaven, we want you to be completely satisfied with your purchase. If you receive an item with size mismatch, color variance, defective stitching, or damaged packaging, you can request a return or replacement within <strong>7 days</strong> of delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">2. Return Eligibility Guidelines</h2>
          <p>To be eligible for a return or replacement:</p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>The item must be unused, unwashed, and in original brand packaging with product tags attached.</li>
            <li>Sarees and kurtis must include unstitched blouse pieces or accessories if originally provided.</li>
            <li>Electronics must have all charging cables and manual booklets intact.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">3. Doorstep Reverse Pickup</h2>
          <p>
            Our logistics partner will arrive at your shipping address to collect the item. You do not need to ship the parcel yourself. Once collected and inspected at our hub, your refund is credited within 3-5 bank business days.
          </p>
        </section>
      </div>
    </div>
  );
}

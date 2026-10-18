import React from 'react';
import Link from 'next/link';

export default function CancellationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-800">Order Flexibility</span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">Cancellation & Refund Policy</h1>
        <p className="text-xs text-stone-500 mt-1">Transparent resolution terms</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">1. Cancellation Before Dispatch</h2>
          <p>
            You can cancel an order at any time before it has been marked as <strong>SHIPPED</strong> by our fulfillment team. You can initiate cancellation from your <Link href="/account/orders" className="text-red-800 font-bold underline">Customer Dashboard</Link> or by contacting customer support at support@shophaven.in.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">2. Refund Processing Time</h2>
          <p>
            • <strong>Prepaid Orders (Cards / NetBanking / Razorpay):</strong> The refund amount will be credited back to your original source account within 3 to 5 banking business days.
          </p>
          <p>
            • <strong>UPI Payments (Google Pay, PhonePe, Paytm):</strong> Instant or within 24 hours back to your linked bank account.
          </p>
          <p>
            • <strong>Cash on Delivery (COD) Returns:</strong> Once the returned item is collected, refunds are processed via UPI or NEFT direct bank transfer upon providing your account details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">3. Stock Restoration</h2>
          <p>
            Whenever an order is cancelled, our inventory engine automatically restores reserved stock back to the store catalog so other buyers can purchase it immediately.
          </p>
        </section>
      </div>
    </div>
  );
}

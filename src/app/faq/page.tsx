import React from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FaqPage() {
  const faqs = [
    {
      q: 'How does ShopHaven offer lower prices than regular shopping malls?',
      a: 'ShopHaven connects buyers directly with authorized artisan weaver societies and manufacturers in Surat, Jaipur, and Delhi. We remove intermediaries, retail showroom rents, and distributor markups, passing the direct wholesale savings to you.',
    },
    {
      q: 'Is Cash on Delivery (COD) available for my address?',
      a: 'Yes! Cash on Delivery is supported for over 28,000+ PIN codes across India. You can also verify serviceability on any product details page by typing in your 6-digit PIN code.',
    },
    {
      q: 'How long will it take for my order to arrive?',
      a: 'Metro cities receive parcels within 2 to 3 business days. Non-metro and Tier-2/3 cities typically arrive in 3 to 5 business days through our verified courier partners (Delhivery, Ekart, BlueDart).',
    },
    {
      q: 'What is your return process?',
      a: 'We offer an easy 7-day doorstep return policy. You can request a return from your Account Dashboard. A courier executive will pick up the parcel from your doorstep with zero return freight charges.',
    },
    {
      q: 'How do I apply coupon codes?',
      a: 'On your Shopping Cart or Checkout page, enter the promotional coupon code (e.g. FIRST100 or FESTIVE15) in the coupon box and click "Apply". Eligible discounts are automatically deducted from your total payable amount.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-red-800">Help & Support</span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-stone-500">Quick answers to common questions about orders, payments, and shipping</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-start gap-2">
              <span className="text-red-800 font-extrabold font-mono">Q.</span>
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs text-stone-600 pl-5 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-stone-100 rounded-2xl text-center space-y-2">
        <h4 className="text-xs font-bold text-stone-800">Still have a question?</h4>
        <p className="text-xs text-stone-500">Reach our care team at support@shophaven.in or call +91 98765 43210.</p>
        <Link href="/contact" className="inline-block mt-1 font-bold text-xs text-red-800 underline">
          Contact Support Center
        </Link>
      </div>
    </div>
  );
}

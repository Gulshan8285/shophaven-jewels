import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-stone-500 mt-1">Effective Date: October 2026</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">1. Information We Collect</h2>
          <p>
            We collect personal information necessary to fulfill orders, deliver shipments, process payments, and provide customer support. This includes your name, delivery address, contact phone number, and email address.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">2. Payment Security</h2>
          <p>
            ShopHaven never stores raw credit card, debit card, or banking credentials on our servers. All online transactions are handled through PCI-DSS compliant secure payment gateway partners with end-to-end encryption.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">3. Data Sharing & Logistics</h2>
          <p>
            We share only essential contact and delivery details with our verified logistics carriers (Delhivery, Ekart, BlueDart) solely for the purpose of doorstep order fulfillment. We never sell your personal data to third-party telemarketers.
          </p>
        </section>
      </div>
    </div>
  );
}

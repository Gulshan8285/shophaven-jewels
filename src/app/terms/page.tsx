import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Terms and Conditions</h1>
        <p className="text-xs text-stone-500 mt-1">Effective Date: October 2026</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the ShopHaven website, customer portal, and associated services, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with any part, please refrain from using the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">2. Customer Account & Security</h2>
          <p>
            When registering an account, you are responsible for maintaining the confidentiality of your login credentials and session tokens. You agree to notify us immediately of any unauthorized access to your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">3. Pricing & Catalog Accuracy</h2>
          <p>
            All prices listed on ShopHaven are quoted in Indian Rupees (INR) and are inclusive of applicable goods and services taxes. While we strive to maintain accurate catalog information, errors in pricing or product descriptions may occasionally occur. In such instances, we reserve the right to rectify or cancel affected orders before dispatch.
          </p>
        </section>
      </div>
    </div>
  );
}

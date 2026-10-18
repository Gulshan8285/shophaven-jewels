import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-800 flex items-center justify-center mx-auto text-2xl font-extrabold">
          404
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          The product, category, or page you are looking for might have been moved or is currently unavailable.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}

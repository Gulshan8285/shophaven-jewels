import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Heart, Building2, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-red-800">
          Direct From India’s Artisans
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          About ShopHaven India
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          Connecting smart Indian shoppers directly with verified weaver clusters, textile manufacturers, and artisans across Gujarat, Rajasthan, and nationwide.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
        <h2 className="text-base font-extrabold text-stone-900">Our Story & Mission</h2>
        <p>
          Founded with a simple premise: Indian shoppers shouldn&apos;t have to pay excessive middleman markups for authentic indigenous craftsmanship. Traditional fashion and home decor travel through multiple wholesale brokers, distributors, and high-street showrooms before reaching you, inflating retail prices by up to 300%.
        </p>
        <p>
          ShopHaven dismantles this inefficient supply chain. By onboarding direct manufacturing clusters in Surat, Sanganer, Jaipur, and Ludhiana, our platform delivers factory-fresh quality directly to your doorstep.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-center">
          <div className="p-4 bg-stone-50 rounded-xl">
            <span className="text-2xl font-extrabold text-red-800 block">50+</span>
            <span className="text-[11px] text-stone-500 font-semibold">Weaver & Factory Partners</span>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <span className="text-2xl font-extrabold text-red-800 block">28,000+</span>
            <span className="text-[11px] text-stone-500 font-semibold">Indian PIN Codes Served</span>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <span className="text-2xl font-extrabold text-red-800 block">100%</span>
            <span className="text-[11px] text-stone-500 font-semibold">Verified Quality Inspection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

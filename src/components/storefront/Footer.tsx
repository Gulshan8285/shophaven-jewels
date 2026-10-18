import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  RotateCcw, 
  Truck, 
  Banknote, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  LayoutDashboard
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#f5f2eb] text-stone-600 pt-14 pb-8 border-t border-[#e6e2d8] font-mono">
      {/* 4 Trust Value Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#e6e2d8]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          
          <div className="p-4 rounded-2xl bg-white border border-[#e6e2d8] flex flex-col md:flex-row items-center md:items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] text-[#b91c1c] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase">[ DIRECT GUILD ]</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">True wholesale factory prices without showroom markup</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e6e2d8] flex flex-col md:flex-row items-center md:items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] text-[#b91c1c] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase">[ FREE DISPATCH ]</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Nationwide delivery on all orders above ₹499</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e6e2d8] flex flex-col md:flex-row items-center md:items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] text-[#b91c1c] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase">[ 7-DAY RETURNS ]</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Doorstep pickup & immediate refund resolution</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e6e2d8] flex flex-col md:flex-row items-center md:items-start gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e6e2d8] text-[#b91c1c] flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase">[ COD READY ]</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Pay after inspecting your parcel at doorstep</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs">
                💎
              </div>
              <span className="font-extrabold text-xl tracking-tight text-stone-900 font-sans">
                SHOPHAVEN <span className="text-[#b91c1c] font-mono text-sm font-bold">JEWELS</span>
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              Direct-from-karigar premium fashion &amp; artificial jewellery atelier. Handcrafted 1-gram gold-plated Kundan, temple jewellery, and German silver collections sourced directly from Jaipur and Rajkot artisan workshops with zero showroom markups.
            </p>
            <div className="space-y-2 text-xs text-stone-600 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#b91c1c] shrink-0" />
                <span>Johari Atelier Logistics Wing, Jaipur, Rajasthan 302003</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#b91c1c] shrink-0" />
                <span>care@shophaven.in</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#b91c1c] shrink-0" />
                <span>+91 98765 43210 [ MON-SAT // 9AM-8PM IST ]</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
              [ JEWELLERY ARCHIVES ]
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/category/necklaces-chokers" className="hover:text-stone-900 transition-colors">Chokers & Necklaces</Link>
              </li>
              <li>
                <Link href="/category/earrings-jhumkas" className="hover:text-stone-900 transition-colors">Jhumkas & Earrings</Link>
              </li>
              <li>
                <Link href="/category/bangles-kadas" className="hover:text-stone-900 transition-colors">Bangles & Kadas</Link>
              </li>
              <li>
                <Link href="/category/mangalsutras-pendants" className="hover:text-stone-900 transition-colors">Mangalsutras & Pendants</Link>
              </li>
              <li>
                <Link href="/category/bridal-heritage" className="hover:text-stone-900 transition-colors">Bridal & Heritage Sets</Link>
              </li>
              <li>
                <Link href="/category/oxidised-bohemian" className="hover:text-stone-900 transition-colors">Oxidised & Boho Silver</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#b91c1c] transition-colors font-bold text-stone-900">Browse Full Catalog (56+) →</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
              [ TELEMETRY & CARE ]
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/track-order" className="hover:text-stone-900 transition-colors">Track Order Status</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-stone-900 transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-stone-900 transition-colors">PIN Code Dispatch Rates</Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-stone-900 transition-colors">Return Logistics Protocol</Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="hover:text-stone-900 transition-colors">Cancellation & Refund Terms</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-stone-900 transition-colors">Connect with Support</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Admin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
              [ ARCHIVE CONTROL ]
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/about" className="hover:text-stone-900 transition-colors">Direct-to-Weaver Model</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-stone-900 transition-colors">Terms of Commerce</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-stone-900 transition-colors">Privacy & Data Protocol</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-stone-900 transition-colors">Customer Authentication</Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#b91c1c]/10 border border-[#b91c1c]/30 hover:bg-[#b91c1c] hover:text-white text-[#b91c1c] transition-all font-bold text-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Control Panel</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Designer Credit & Copyright (Explicitly requested: Created & Designed by codeorbit.cloud) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 border-t border-[#e6e2d8] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <p>© 2026 ShopHaven Direct Commerce. All rights reserved.</p>
          <span className="hidden sm:inline text-stone-300">•</span>
          {/* Explicit User Credit */}
          <a
            href="https://codeorbit.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-stone-800 hover:text-[#b91c1c] font-bold transition-colors"
          >
            <span>Created & Designed by codeorbit.cloud</span>
            <ExternalLink className="w-3 h-3 text-[#b91c1c]" />
          </a>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-stone-400">[ GATEWAY: UPI / CARDS / NETBANKING / COD ]</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
            ● 100% COD AVAILABLE
          </span>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  Package, 
  LayoutDashboard,
  PhoneCall,
  Sparkles,
  Tag,
  Zap
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const { itemCount, subtotal, openCartDrawer } = useCart();
  const { user, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Announcement items
  const announcements = [
    '👑 ROYAL FESTIVE JEWELLERY DROP: FLAT ₹100 OFF (FIRST100) • 10% OFF (FESTIVE15)',
    '✨ 1-GRAM MICRO GOLD FINISH • KUNDAN & POLKI FASHION JEWELLERY • ZERO BROKER MARKUP',
    '🚚 NATIONWIDE EXPRESS DISPATCH • CASH ON DELIVERY • 7-DAY SAFE RETURNS',
  ];
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const categories = [
    { name: 'Chokers & Necklaces', slug: 'necklaces-chokers', badge: 'ROYAL' },
    { name: 'Jhumkas & Earrings', slug: 'earrings-jhumkas', badge: 'HOT' },
    { name: 'Bangles & Kadas', slug: 'bangles-kadas' },
    { name: 'Mangalsutras', slug: 'mangalsutras-pendants' },
    { name: 'Bridal Sets', slug: 'bridal-heritage', badge: 'EXCLUSIVE' },
    { name: 'Oxidised Silver', slug: 'oxidised-bohemian' },
  ];

  return (
    <div className="sticky top-0 z-40 w-full text-stone-900 px-2 sm:px-4 pt-1.5 sm:pt-2.5 transition-all">
      
      {/* 1. Top Announcement & Embedded Search Bar (Creamy Luxury Header) */}
      <div className="max-w-7xl mx-auto mb-2 px-3 py-1.5 rounded-xl bg-[#f5f2eb]/95 backdrop-blur-md border border-[#e6e2d8] flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-xs">
        
        {/* Left: Animated Status Ticker */}
        <div className="flex items-center gap-2 truncate max-w-xs sm:max-w-md">
          <span className="w-2 h-2 rounded-full bg-[#b91c1c] glyph-pulse shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-bold text-stone-800 truncate">
            {announcements[activeAnnouncement]}
          </span>
        </div>

        {/* Center: Top Global Search Box with Dynamic 50% Off Promo Badge */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search Kundan chokers, jhumkas, bridal sets, silver kadas..."
              className="w-full bg-white border border-[#e6e2d8] hover:border-stone-400 focus:border-stone-900 rounded-full py-1.5 pl-8 pr-28 text-[11px] text-stone-900 placeholder-stone-400 font-mono focus:outline-none transition-all shadow-xs"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />

            {/* Dynamic 50% Off Promo Badge */}
            {!searchQuery && !searchFocused && (
              <span className="absolute right-2 flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold pointer-events-none animate-pulse">
                <Tag className="w-2.5 h-2.5" /> 50% OFF FIRST ORDER
              </span>
            )}
          </div>
        </form>

        {/* Right: Quick Links & Trust Badge (Admin panel removed from public view as requested) */}
        <div className="flex items-center space-x-3 text-[10px] text-stone-600 shrink-0 uppercase tracking-wider font-mono">
          <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            100% COD AVAILABLE
          </span>
          <span className="text-stone-300 hidden sm:inline">|</span>
          <Link href="/track-order" className="hover:text-stone-950 transition-colors hidden md:flex items-center gap-1 font-semibold">
            <Package className="w-3 h-3 text-[#b91c1c]" /> TRACK ORDER
          </Link>
          <span className="text-stone-300 hidden md:inline">|</span>
          <Link href="/contact" className="hover:text-stone-950 transition-colors hidden sm:flex items-center gap-1 font-semibold">
            <PhoneCall className="w-3 h-3 text-[#b91c1c]" /> 24/7 CARE
          </Link>
        </div>
      </div>

      {/* 2. Floating Card Header Dock (Creamy Luxury Island) */}
      <header className="max-w-7xl mx-auto rounded-2xl bg-white/95 backdrop-blur-2xl border border-[#e6e2d8] shadow-md px-3 sm:px-6 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Clean Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-950 text-amber-300 flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform font-mono shrink-0">
                💎
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-sm sm:text-lg tracking-tight text-stone-950 font-sans">
                    SHOPHAVEN JEWELS
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] glyph-pulse" />
                </div>
                <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-stone-500 -mt-0.5 font-bold hidden sm:block">
                  ROYAL ATELIER • KARIGAR DIRECT
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Clean Simplified Single-Line Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-mono font-medium text-stone-700 whitespace-nowrap overflow-x-auto scrollbar-none py-1">
            <Link
              href="/shop"
              className="hover:text-[#b91c1c] transition-colors flex items-center gap-1.5 text-stone-950 font-bold group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]" />
              <span>ALL SHOP</span>
            </Link>

            <Link
              href="/category/necklaces-chokers"
              className="hover:text-[#b91c1c] transition-colors py-1 uppercase tracking-wider text-[11px] font-semibold text-stone-700"
            >
              CHOKERS & SETS
            </Link>

            <Link
              href="/category/earrings-jhumkas"
              className="hover:text-[#b91c1c] transition-colors py-1 uppercase tracking-wider text-[11px] font-semibold text-stone-700"
            >
              JHUMKAS & EARRINGS
            </Link>

            <Link
              href="/category/bangles-kadas"
              className="hover:text-[#b91c1c] transition-colors py-1 uppercase tracking-wider text-[11px] font-semibold text-stone-700"
            >
              BANGLES & KADAS
            </Link>

            <Link
              href="/category/bridal-heritage"
              className="hover:text-[#b91c1c] transition-colors py-1 uppercase tracking-wider text-[11px] font-semibold text-stone-700"
            >
              BRIDAL SETS
            </Link>

            <Link
              href="/shop?sort=bestseller"
              className="hover:text-[#b91c1c] transition-colors py-1 uppercase tracking-wider text-[11px] font-bold text-[#b91c1c]"
            >
              BESTSELLERS
            </Link>
          </nav>

          {/* Right: Mobile-Responsive Action Controls (Account & Bag) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 font-mono">
            
            {/* Account / Sign-In Button (Compact & Aligned on Mobile) */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-full hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-900 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="py-1.5 px-2.5 sm:px-3.5 rounded-full border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-stone-800 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
                  title="Sign In"
                >
                  <User className="w-3.5 h-3.5 text-[#b91c1c]" />
                  <span className="hidden sm:inline">SIGN IN</span>
                </Link>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in duration-150 font-mono text-xs">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="font-bold text-stone-950 truncate">{user.name}</p>
                    <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[#b91c1c] hover:bg-red-50 font-bold"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    ADMIN CONTROL PANEL
                  </Link>

                  <Link
                    href="/account/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-50 font-medium"
                  >
                    <Package className="w-3.5 h-3.5 text-stone-400" />
                    MY ORDERS & TRACKING
                  </Link>

                  <div className="border-t border-stone-100 my-1"></div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    SIGN OUT
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Bag Drawer Button */}
            <button
              onClick={openCartDrawer}
              aria-label="Open cart drawer"
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <div className="relative">
                <ShoppingBag className="w-3.5 h-3.5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#b91c1c] text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">BAG</span>
              {subtotal > 0 && (
                <span className="hidden md:inline pl-1.5 border-l border-stone-700 font-bold text-amber-300">
                  {formatPrice(subtotal)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar inside header on phone screens */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 md:hidden relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog... [50% OFF: FIRST100]"
            className="w-full bg-[#f5f2eb] border border-[#e6e2d8] rounded-xl py-2 pl-8 pr-16 text-xs text-stone-900 placeholder-stone-400 font-mono focus:outline-none focus:border-stone-900"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-stone-950 text-white rounded-lg text-[10px] font-bold"
          >
            GO
          </button>
        </form>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-[#e6e2d8] bg-white p-5 space-y-4 font-mono shadow-xl text-stone-900">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
              [ COLLECTIONS ]
            </span>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-[#b91c1c]"
            >
              VIEW ALL CATALOG →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-1 text-xs font-semibold text-stone-800">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-xl hover:bg-stone-50 flex items-center justify-between"
              >
                <span>{c.name}</span>
                {c.badge && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-50 text-[#b91c1c] border border-red-200">
                    {c.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2 text-xs">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#b91c1c] font-bold flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" /> [ ADMIN CONTROL PANEL ]
            </Link>
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-stone-700 hover:text-stone-950 flex items-center gap-2 font-medium"
            >
              <Package className="w-4 h-4 text-[#b91c1c]" /> [ TRACK ORDER STATUS ]
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

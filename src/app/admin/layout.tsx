'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  UploadCloud, 
  Users, 
  Tag, 
  Building2, 
  Settings, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders & Shipments', href: '/admin/orders', icon: Package },
    { label: 'Products & Variants', href: '/admin/products', icon: ShoppingBag },
    { label: 'CSV Bulk Import', href: '/admin/products/import', icon: UploadCloud },
    { label: 'Suppliers & Catalogs', href: '/admin/suppliers', icon: Building2 },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col md:flex-row text-stone-900 font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center font-bold text-sm">
            SH
          </div>
          <span className="font-bold text-sm">ShopHaven Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 w-64 bg-stone-900 text-stone-300 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 to-amber-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                SH
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-white tracking-tight leading-none">
                  Shop<span className="text-red-500">Haven</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mt-0.5">
                  Store Management
                </span>
              </div>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-red-800 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-800/80 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              Live Storefront
            </span>
            <span className="text-[10px] text-stone-500">View</span>
          </Link>

          <div className="pt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-red-950 text-red-300 border border-red-800 flex items-center justify-center font-bold text-[11px]">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="font-bold text-white text-[11px] truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-stone-500 capitalize">{user?.role?.toLowerCase() || 'staff'}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 rounded-md hover:bg-stone-800 text-stone-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refreshUser();
        if (data.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
      } else {
        setErrorMessage(data.error || 'Invalid credentials');
      }
    } catch {
      setErrorMessage('Could not connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  const setPresetUser = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#faf8f5] text-stone-900 font-mono">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-stone-950 text-amber-300 flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              💎
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-stone-950 font-sans">
              SHOPHAVEN <span className="text-[#b91c1c]">JEWELS</span>
            </span>
          </Link>
          <h2 className="text-lg font-sans font-bold text-stone-900 tracking-tight">
            Sign in to Your Account
          </h2>
          <p className="text-xs text-stone-500">
            Track orders, manage wishlist, and enjoy direct karigar prices
          </p>
        </div>

        {/* Quick Credentials Preset Pill */}
        <div className="bg-[#f4f1ea] border border-[#e6e2d8] rounded-2xl p-3.5 text-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
            <span>Quick Login Presets</span>
            <span className="text-[10px] text-stone-500 font-normal">Click to fill</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPresetUser('admin@ecom.local', 'Admin@123456')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-stone-950 text-white font-bold text-[11px] hover:bg-[#b91c1c] transition-colors cursor-pointer"
            >
              Admin Master
            </button>
            <button
              type="button"
              onClick={() => setPresetUser('customer@example.com', 'Customer@123')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-[#e6e2d8] text-stone-900 font-bold text-[11px] hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Customer Demo
            </button>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Clean Luxury Form Card */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-mono"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <Link href="#" className="text-[11px] text-[#b91c1c] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-950 hover:bg-[#b91c1c] text-white font-bold text-xs py-3 rounded-xl shadow-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to ShopHaven'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e6e2d8] text-center">
            <p className="text-xs text-stone-500">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="font-bold text-[#b91c1c] hover:underline">
                Create new account
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>256-Bit SSL Encrypted Session</span>
        </div>

      </div>
    </div>
  );
}

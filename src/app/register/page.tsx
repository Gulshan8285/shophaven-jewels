'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, Phone, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refreshUser();
        router.push('/account');
      } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch {
      setErrorMessage('Could not connect to registration server');
    } finally {
      setLoading(false);
    }
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
            Create Customer Account
          </h2>
          <p className="text-xs text-stone-500">
            Enjoy factory-direct prices, free delivery above ₹499 &amp; COD protection
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <input
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-mono"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="priya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-mono"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Mobile Phone (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#faf8f5] border border-[#e6e2d8] rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-mono"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Password (Min. 6 characters) *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e6e2d8] text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#b91c1c] hover:underline">
                Sign in
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

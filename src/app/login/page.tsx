'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50/70">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-800 to-amber-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              SH
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-stone-900">
              Shop<span className="text-red-800">Haven</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-xs text-stone-500">
            Track orders, view saved addresses, and access exclusive factory prices
          </p>
        </div>

        {/* Demo Fast Login Pill for convenience */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
            <span>Quick Login Presets (Development)</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPresetUser('admin@shophaven.in', 'AdminSecure@2026')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-red-900 text-white font-bold text-[11px] hover:bg-red-950 transition-colors"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => setPresetUser('rahul.sharma@example.com', 'Customer@123')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900 text-white font-bold text-[11px] hover:bg-stone-800 transition-colors"
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

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">Password</label>
                <Link href="#" className="text-[11px] text-red-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-800 hover:bg-red-900 text-white font-bold text-xs py-3 rounded-xl shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="font-bold text-red-800 hover:underline">
                Create new account
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Session Protection</span>
        </div>

      </div>
    </div>
  );
}

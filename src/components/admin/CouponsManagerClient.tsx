'use client';

import React, { useState } from 'react';
import { Tag, Plus, Check, Trash2, Calendar, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice, formatShortDate } from '@/lib/utils';

export interface CouponItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  validUntil: string | Date;
  usedCount: number;
  isActive: boolean;
}

export default function CouponsManagerClient({ initialCoupons }: { initialCoupons: CouponItem[] }) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '15',
    minOrderValueRupees: '499',
    maxDiscountRupees: '200',
    daysValid: '30',
  });

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons([data.coupon, ...coupons]);
        setShowCreateModal(false);
        setForm({
          code: '',
          description: '',
          discountType: 'PERCENTAGE',
          discountValue: '15',
          minOrderValueRupees: '499',
          maxDiscountRupees: '200',
          daysValid: '30',
        });
      } else {
        setError(data.error || 'Failed to create coupon');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500">
          Configure promotional promo codes, cart thresholds, and discount caps
        </p>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-800 hover:bg-red-900 text-white font-bold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Coupon Code
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-base px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 tracking-wider">
                  {c.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {c.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2">
                {c.description || 'Promotional seasonal discount code'}
              </p>

              <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <strong className="text-stone-900">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} Flat`}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Min Order Value:</span>
                  <span>{formatPrice(c.minOrderValue)}</span>
                </div>
                {c.maxDiscount && (
                  <div className="flex justify-between">
                    <span>Max Discount Cap:</span>
                    <span>{formatPrice(c.maxDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Valid Until:</span>
                  <span>{formatShortDate(c.validUntil)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span>{c.usedCount} times redeemed</span>
              <span className="text-emerald-700 font-bold">Auto-Validated</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-stone-900">Create New Coupon</h3>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Coupon Code *</label>
                <Input
                  required
                  placeholder="e.g. DIWALI20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <Input
                  placeholder="Get 20% discount on orders above ₹799"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full h-10 rounded-lg border border-stone-300 px-3 text-xs font-medium focus:outline-none focus:border-red-800"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Value *</label>
                  <Input
                    required
                    type="number"
                    min={1}
                    placeholder={form.discountType === 'PERCENTAGE' ? '15' : '100'}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Min Order Value (₹)</label>
                  <Input
                    type="number"
                    placeholder="499"
                    value={form.minOrderValueRupees}
                    onChange={(e) => setForm({ ...form, minOrderValueRupees: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Max Cap (₹, for %)</label>
                  <Input
                    type="number"
                    placeholder="300"
                    value={form.maxDiscountRupees}
                    onChange={(e) => setForm({ ...form, maxDiscountRupees: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading} className="bg-red-800 text-white font-bold">
                  {loading ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

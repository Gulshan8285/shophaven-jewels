'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrderData(data.order);
      } else {
        setError(data.error || 'No matching order found. Please check your order ID or tracking number.');
      }
    } catch {
      setError('Unable to reach order tracking network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-red-800">
          Consignment Tracking
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Track Your Shipment
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Enter your ShopHaven Order Number (e.g. <strong className="text-stone-800 font-mono">SHP-2026-9812</strong>) or Consignment AWB tracking number.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs max-w-xl mx-auto">
        <form onSubmit={handleTrack} className="flex gap-2">
          <Input
            required
            placeholder="e.g. SHP-2026-9812 or DEL-9928172635"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-xs uppercase font-mono"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-red-800 hover:bg-red-900 text-white font-bold text-xs px-6 shrink-0"
          >
            {loading ? 'Tracking...' : 'Track'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {orderData && (
        <div className="mt-10 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Order Reference</span>
              <h2 className="text-lg font-extrabold text-stone-900 font-mono">{orderData.orderNumber}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                Status: {orderData.status}
              </span>
              <span className="text-sm font-extrabold text-stone-900">
                {formatPrice(orderData.total)}
              </span>
            </div>
          </div>

          {/* Courier & Tracking */}
          {orderData.shipments?.[0] && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">
                    Logistics Courier: {orderData.shipments[0].courierName}
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Tracking AWB: {orderData.shipments[0].trackingNumber}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 text-[11px]">
                {orderData.shipments[0].status}
              </span>
            </div>
          )}

          {/* Tracking Stages Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Order Placed</span>
              </div>
              <p className="text-[11px] text-stone-500">{formatDate(orderData.createdAt)}</p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${
              orderData.status !== 'PENDING' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-400'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Quality Inspection</span>
              </div>
              <p className="text-[11px] text-stone-500">Verified manufacturer stock</p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${
              orderData.status === 'SHIPPED' || orderData.status === 'DELIVERED' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-400'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                <Truck className="w-4 h-4" />
                <span>Out in Transit</span>
              </div>
              <p className="text-[11px] text-stone-500">With delivery partner</p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${
              orderData.status === 'DELIVERED' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-400'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                <Package className="w-4 h-4" />
                <span>Doorstep Delivery</span>
              </div>
              <p className="text-[11px] text-stone-500">{orderData.status === 'DELIVERED' ? 'Delivered successfully' : 'Pending arrival'}</p>
            </div>
          </div>

          {/* Items Preview */}
          <div className="pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600 mb-2">Package Contents:</h4>
            <div className="space-y-2">
              {orderData.items.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-stone-100 bg-stone-50/40">
                  <span className="font-semibold text-stone-900">{it.title} (x{it.quantity})</span>
                  <span className="font-mono text-stone-600">{formatPrice(it.total)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

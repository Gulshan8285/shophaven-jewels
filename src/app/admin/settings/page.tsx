'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    storeName: 'ShopHaven India',
    email: 'support@shophaven.in',
    phone: '+91 98765 43210',
    address: 'ShopHaven Fulfillment Hub, Sector 18, Gurugram, Haryana 122008',
    freeShippingThresholdRupees: '499',
    standardShippingFeeRupees: '49',
    enableCod: true,
    enableOnlinePayment: true,
    announcementBanner: '⚡ MEGA FESTIVE SALE: Extra 10% OFF with code FESTIVE15 | Free Shipping on orders over ₹499',
  });

  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setForm({
            storeName: s.storeName,
            email: s.email,
            phone: s.phone,
            address: s.address,
            freeShippingThresholdRupees: String(s.freeShippingThreshold / 100),
            standardShippingFeeRupees: String(s.standardShippingFee / 100),
            enableCod: s.enableCod,
            enableOnlinePayment: s.enableOnlinePayment,
            announcementBanner: s.announcementBanner,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Store Settings</h1>
          <p className="text-xs text-stone-500 mt-1">
            Global store metadata, fulfillment thresholds, and payment gateway switches
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Store settings successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Contact */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs text-xs">
          <h2 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">
            Store Identity & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Store Name</label>
              <Input
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Support Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Support Phone</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Currency</label>
              <Input disabled value="INR (₹) - Indian Rupee" className="bg-stone-50" />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-stone-700 block mb-1">Fulfillment Hub Address</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Shipping & Payment Rules */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs text-xs">
          <h2 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">
            Delivery Charges & Payment Gateways
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Free Delivery Threshold (₹)</label>
              <Input
                type="number"
                value={form.freeShippingThresholdRupees}
                onChange={(e) => setForm({ ...form, freeShippingThresholdRupees: e.target.value })}
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Orders above this amount get free delivery</span>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Standard Delivery Fee (₹)</label>
              <Input
                type="number"
                value={form.standardShippingFeeRupees}
                onChange={(e) => setForm({ ...form, standardShippingFeeRupees: e.target.value })}
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Applied when order total is below threshold</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-6 font-semibold text-stone-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableCod}
                onChange={(e) => setForm({ ...form, enableCod: e.target.checked })}
                className="rounded text-red-800 focus:ring-red-800"
              />
              <span>Enable Cash on Delivery (COD)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableOnlinePayment}
                onChange={(e) => setForm({ ...form, enableOnlinePayment: e.target.checked })}
                className="rounded text-red-800 focus:ring-red-800"
              />
              <span>Enable Online Razorpay / Card Payments</span>
            </label>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs text-xs">
          <h2 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">
            Storefront Announcement Banner
          </h2>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Banner Text (Top of website)</label>
            <Input
              value={form.announcementBanner}
              onChange={(e) => setForm({ ...form, announcementBanner: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs shadow-md"
          >
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}

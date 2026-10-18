'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-red-800">
          24/7 Dedicated Care
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Contact Customer Support
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Have a question about your order, delivery timeline, or supplier catalog? We’re always here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact info cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4 text-xs text-stone-600">
            <h3 className="font-extrabold text-sm text-stone-900">Direct Support Channels</h3>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-800 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900">Email Inquiries</p>
                <p className="text-stone-500">support@shophaven.in</p>
                <p className="text-[10px] text-stone-400">Response within 2 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900">Helpline & WhatsApp</p>
                <p className="text-stone-500">+91 98765 43210</p>
                <p className="text-[10px] text-stone-400">Mon - Sat, 9:00 AM - 8:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900">Central Hub</p>
                <p className="text-stone-500 leading-relaxed">
                  ShopHaven Fulfillment Hub, Sector 18, Electronic City, Gurugram, Haryana 122008
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">Message Received!</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Thank you, {formData.name}. Our customer care team will respond to {formData.email} shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-stone-900 pb-2 border-b border-stone-100">
                Send Us a Message
              </h3>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Your Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Anjali Gupta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email Address *</label>
                  <Input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mobile Phone</label>
                  <Input
                    placeholder="10-digit phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Your Message or Order Query *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist you with your shopping or order?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-3 text-xs focus:outline-none focus:border-red-800"
                />
              </div>

              <Button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-bold">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

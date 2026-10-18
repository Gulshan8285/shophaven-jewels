import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { 
  User, 
  Package, 
  MapPin, 
  Coins, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Truck
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default async function AccountPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          items: true,
          shipments: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const totalOrdersCount = await prisma.order.count({
    where: { userId: user.id },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account Overview Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-800 to-amber-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">{user.name}</h1>
            <p className="text-xs text-stone-500">{user.email} • {user.phone || 'No phone added'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
              Verified Customer
            </span>
          </div>
        </div>

        {/* Loyalty & Rewards Pill */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center">
            <Coins className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-950 block">ShopHaven Rewards</span>
            <span className="text-lg font-extrabold text-amber-900 leading-none">
              {user.profile?.loyaltyPoints || 50} Points
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Saved Addresses */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-red-800" />
              <h2 className="text-lg font-extrabold text-stone-900">Recent Orders</h2>
            </div>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center gap-1"
            >
              View All ({totalOrdersCount}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {user.orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center space-y-3">
              <Package className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500">You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className="inline-block px-4 py-2 bg-red-800 text-white rounded-lg text-xs font-semibold">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {user.orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                    <div>
                      <span className="font-extrabold text-stone-900 font-mono">{order.orderNumber}</span>
                      <span className="text-stone-400 mx-2">•</span>
                      <span className="text-stone-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {order.status}
                      </span>
                      <span className="font-extrabold text-stone-950 text-sm">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex flex-wrap gap-3 py-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-xs bg-stone-50 p-1.5 rounded-lg border border-stone-200/80">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-8 h-8 object-cover rounded" />
                        )}
                        <span className="font-medium text-stone-800 truncate max-w-[150px]">{item.title}</span>
                        <span className="text-stone-500">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                    <span className="capitalize">
                      Method: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                    <Link
                      href={`/order-success/${order.orderNumber}`}
                      className="font-bold text-red-800 hover:underline flex items-center gap-1"
                    >
                      Track Order & Receipt <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Addresses Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-800" />
            <h2 className="text-lg font-extrabold text-stone-900">Saved Addresses</h2>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
            {user.addresses.length === 0 ? (
              <p className="text-xs text-stone-500">No saved address yet. It will automatically save during your next checkout.</p>
            ) : (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div key={addr.id} className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 text-xs text-stone-600 space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{addr.fullName}</span>
                      <span className="text-[10px] uppercase font-bold text-red-800 bg-red-50 px-1.5 py-0.5 rounded">
                        {addr.addressType}
                      </span>
                    </div>
                    <p>{addr.streetAddress}</p>
                    {addr.landmark && <p>Near: {addr.landmark}</p>}
                    <p>{addr.city}, {addr.state} - <strong>{addr.postalCode}</strong></p>
                    <p className="pt-1 font-medium text-stone-800">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Help */}
          <div className="bg-stone-100 rounded-xl p-4 text-xs text-stone-600 space-y-2">
            <h4 className="font-bold text-stone-900">Need help with an order?</h4>
            <p>Our customer support team is available 24/7 on WhatsApp & Email.</p>
            <Link href="/contact" className="inline-block font-bold text-red-800 underline">
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

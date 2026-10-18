import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Package, ArrowLeft, ArrowRight, Truck, CheckCircle2, Clock } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default async function CustomerOrdersPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      shipments: true,
      payments: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <Link href="/account" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900">My Orders & Purchases</h1>
        </div>
        <span className="text-xs text-stone-500 font-semibold">{orders.length} Total Orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center my-8 space-y-4">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-900">No orders placed yet</h3>
          <p className="text-xs text-stone-500">Your future order tracking and invoices will appear here.</p>
          <Link href="/shop" className="inline-block px-5 py-2.5 bg-red-800 text-white rounded-lg text-xs font-bold">
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => {
            const shipment = order.shipments[0];

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs"
              >
                {/* Order Top Bar */}
                <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-stone-500 block text-[11px]">ORDER PLACED</span>
                      <strong className="text-stone-900">{formatDate(order.createdAt)}</strong>
                    </div>
                    <div className="h-6 w-px bg-stone-300"></div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">TOTAL AMOUNT</span>
                      <strong className="text-stone-900">{formatPrice(order.total)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      Status: {order.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-800">
                      #{order.orderNumber}
                    </span>
                  </div>
                </div>

                {/* Items & Tracking */}
                <div className="p-6 space-y-4">
                  {shipment && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-red-800" />
                        <span>Courier: <strong>{shipment.courierName}</strong></span>
                        <span className="text-stone-400">•</span>
                        <span>Tracking: <strong className="font-mono">{shipment.trackingNumber}</strong></span>
                      </div>
                      <span className="font-bold text-emerald-700 uppercase text-[10px]">
                        {shipment.status}
                      </span>
                    </div>
                  )}

                  <div className="divide-y divide-stone-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-3 flex gap-4 items-center text-xs">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-18 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-200"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-stone-500">
                            Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''} {item.color ? `• Color: ${item.color}` : ''}
                          </p>
                          <p className="font-extrabold text-stone-900 mt-1">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      Payment Mode: <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Prepaid'}</strong>
                    </span>
                    <Link
                      href={`/order-success/${order.orderNumber}`}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      View Receipt & Tracking <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

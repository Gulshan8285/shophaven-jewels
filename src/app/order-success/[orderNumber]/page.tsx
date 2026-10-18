import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  ArrowRight, 
  ShoppingBag,
  Clock
} from 'lucide-react';

interface OrderSuccessProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      shipments: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  let shippingAddress: {
    fullName: string;
    phone: string;
    streetAddress: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
  } | null = null;

  try {
    shippingAddress = JSON.parse(order.shippingAddressSnapshot);
  } catch {}

  const tracking = order.shipments[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Hero */}
      <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-10 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Order Confirmed</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Thank You for Shopping with ShopHaven!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
            Your order <strong className="text-stone-900 font-mono">{order.orderNumber}</strong> has been received by our manufacturer fulfillment team.
          </p>
        </div>

        <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-stone-100 font-bold text-stone-700">
            Payment: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-100 font-bold text-emerald-800">
            Status: {order.status}
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-100 font-bold text-amber-900">
            Total: {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Shipment & Tracking Milestone */}
      <div className="mt-8 bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
            <Truck className="w-4 h-4 text-red-800" />
            <span>Delivery Tracking & Transit</span>
          </div>
          {tracking && (
            <span className="text-xs font-mono text-stone-500">
              Courier: <strong>{tracking.courierName}</strong> • AWB: <strong>{tracking.trackingNumber}</strong>
            </span>
          )}
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Confirmed</span>
            </div>
            <p className="text-[11px] text-stone-500">{formatDate(order.createdAt)}</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-700">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>Packing & QC</span>
            </div>
            <p className="text-[11px] text-stone-400">At manufacturer warehouse</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-700">
              <Truck className="w-4 h-4 text-stone-400" />
              <span>Dispatched</span>
            </div>
            <p className="text-[11px] text-stone-400">Assigned to courier</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-700">
              <Package className="w-4 h-4 text-stone-400" />
              <span>Delivered</span>
            </div>
            <p className="text-[11px] text-stone-400">Estimated in 3-5 days</p>
          </div>
        </div>
      </div>

      {/* Order Details & Delivery Address */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Items */}
        <div className="md:col-span-7 bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <h3 className="font-extrabold text-sm text-stone-900 pb-2 border-b border-stone-100">
            Ordered Items ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 text-xs items-center">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-16 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-900 truncate">{item.title}</p>
                  <p className="text-[11px] text-stone-500">
                    Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''} {item.color ? `• Color: ${item.color}` : ''}
                  </p>
                  <p className="font-extrabold text-stone-900 mt-0.5">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing summary */}
          <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-stone-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon Discount ({order.couponCode}):</span>
                <span>- {formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-stone-900 text-sm pt-2 border-t border-stone-200">
              <span>Total Paid / Payable:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="md:col-span-5 bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
            <MapPin className="w-4 h-4 text-red-800" />
            <span>Shipping Destination</span>
          </div>

          {shippingAddress ? (
            <div className="text-xs text-stone-600 space-y-1 leading-relaxed">
              <p className="font-bold text-stone-900 text-sm">{shippingAddress.fullName}</p>
              <p>{shippingAddress.streetAddress}</p>
              {shippingAddress.landmark && <p>Landmark: {shippingAddress.landmark}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
              <p className="font-medium text-stone-900 pt-1">Phone: {shippingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-xs text-stone-400">Address recorded on order file</p>
          )}

          <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
            <Link
              href="/account/orders"
              className="w-full py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs text-center transition-colors"
            >
              View Order in My Account
            </Link>
            <Link
              href="/shop"
              className="w-full py-2.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs text-center transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  AlertTriangle, 
  IndianRupee,
  ArrowRight,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export default async function AdminDashboardPage() {
  await checkAdminAccess();

  // Date boundary for "Today"
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 1. Order Status Counts
  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
    prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
  ]);

  // 2. Real sales calculation: sum total of DELIVERED or CAPTURED orders
  const fulfilledOrders = await prisma.order.findMany({
    where: {
      OR: [
        { paymentStatus: PaymentStatus.CAPTURED },
        { status: OrderStatus.DELIVERED },
      ],
      NOT: {
        status: OrderStatus.CANCELLED,
      },
    },
    select: { total: true },
  });

  const totalSalesPaise = fulfilledOrders.reduce((sum, order) => sum + order.total, 0);

  // 3. Refunds total
  const refunds = await prisma.refund.findMany({
    select: { amount: true },
  });
  const totalRefundsPaise = refunds.reduce((sum, r) => sum + r.amount, 0);

  // 4. Low stock products (stock <= lowStockAlert)
  const lowStockProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { lte: 10 },
    },
    take: 5,
    include: {
      brand: true,
      supplier: true,
    },
  });

  // 5. Recent 6 Orders
  const recentOrders = await prisma.order.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { take: 1 },
      shipments: { take: 1 },
    },
  });

  // 6. Bestselling Products
  const bestsellers = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { stock: 'asc' }, // items moving fastest
    take: 5,
    include: {
      brand: true,
      images: { take: 1 },
      _count: { select: { orderItems: true } },
    },
  });

  return (
    <div className="space-y-8">
      
      {/* Dashboard Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Store Performance Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time business metrics, fulfillment lifecycle, and inventory alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/products/import"
            className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            Import CSV
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Fulfilled Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-950">
              {formatPrice(totalSalesPaise)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              From paid & delivered orders
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-950">
              {totalOrders}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              <strong className="text-stone-700">{todayOrders}</strong> placed today
            </p>
          </div>
        </div>

        {/* Shipped & In-Transit */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">In-Transit / Shipped</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-950">
              {shippedOrders}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {deliveredOrders} successfully delivered
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Low Stock Warnings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-900">
              {lowStockProducts.length}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Items requiring immediate restock
            </p>
          </div>
        </div>

      </div>

      {/* Order Status Breakdown Pill Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
          Order Fulfillment Pipeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <span className="text-amber-800 font-semibold block text-[11px]">Pending Approval</span>
            <span className="text-lg font-extrabold text-amber-950">{pendingOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200/80">
            <span className="text-sky-800 font-semibold block text-[11px]">Confirmed</span>
            <span className="text-lg font-extrabold text-sky-950">{confirmedOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80">
            <span className="text-indigo-800 font-semibold block text-[11px]">Dispatched / Shipped</span>
            <span className="text-lg font-extrabold text-indigo-950">{shippedOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-emerald-800 font-semibold block text-[11px]">Delivered</span>
            <span className="text-lg font-extrabold text-emerald-950">{deliveredOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-100 border border-stone-200">
            <span className="text-stone-600 font-semibold block text-[11px]">Cancelled</span>
            <span className="text-lg font-extrabold text-stone-900">{cancelledOrders}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-extrabold text-stone-900">Recent Customer Orders</h2>
              <p className="text-[11px] text-stone-500">Live order queue from store</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-red-800 hover:underline flex items-center gap-1"
            >
              Manage All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Order Ref</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-stone-800">{ord.user.name}</p>
                      <p className="text-[10px] text-stone-400">{ord.user.email}</p>
                    </td>
                    <td className="py-3 px-3 text-stone-500">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-stone-900">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/orders?id=${ord.id}`}
                        className="px-2.5 py-1 rounded bg-stone-100 hover:bg-red-800 hover:text-white text-stone-700 font-semibold text-[11px] transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-extrabold text-stone-900">Inventory Watch</h2>
              <p className="text-[11px] text-stone-500">Items below threshold</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-red-800 hover:underline"
            >
              All Products
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">All product stocks healthy!</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 text-xs space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-stone-900 line-clamp-1">{p.title}</p>
                    <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>SKU: {p.sku}</span>
                    <span>Supplier: {p.supplier?.name || 'Direct'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

import React from 'react';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';
import OrdersManagerClient from '@/components/admin/OrdersManagerClient';

export default async function AdminOrdersPage() {
  await checkAdminAccess();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      items: true,
      shipments: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Orders & Shipment Dispatch
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review, confirm, pack, assign logistics couriers, or handle customer order cancellations
        </p>
      </div>

      <OrdersManagerClient initialOrders={orders} />
    </div>
  );
}

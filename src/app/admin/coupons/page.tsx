import React from 'react';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';
import CouponsManagerClient from '@/components/admin/CouponsManagerClient';

export default async function AdminCouponsPage() {
  await checkAdminAccess();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Coupons & Discount Promotions
        </h1>
      </div>

      <CouponsManagerClient initialCoupons={coupons} />
    </div>
  );
}

import React from 'react';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';
import { Users, Mail, Phone, Calendar, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminCustomersPage() {
  await checkAdminAccess();

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      profile: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Registered Customers
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Registered buyer accounts, contact details, and lifetime order history
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Loyalty Points</th>
                <th className="py-3 px-4">Joined On</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No customers registered yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-900 font-bold flex items-center justify-center text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-stone-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                      {c.email}
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 font-bold text-stone-800 text-[11px]">
                        {c._count.orders} orders
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-900">
                      {c.profile?.loyaltyPoints || 0} pts
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

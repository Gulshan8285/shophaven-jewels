import React from 'react';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';
import { Building2, Phone, Mail, MapPin, Package, Plus } from 'lucide-react';

export default async function AdminSuppliersPage() {
  await checkAdminAccess();

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Suppliers & Artisan Manufacturing Hubs
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage verified direct-from-manufacturer supplier partnerships and feeds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Authorized Supplier
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-stone-900">{s.name}</h3>
                {s.contactPerson && (
                  <p className="text-xs text-stone-500 mt-0.5">Contact: {s.contactPerson}</p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{s.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-stone-700">
                <Package className="w-4 h-4 text-amber-600" />
                <strong>{s._count.products}</strong> Products Supplied
              </span>
              <span className="text-emerald-700 font-bold text-[11px]">Sync Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

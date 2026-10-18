'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  UploadCloud, 
  Edit, 
  Check, 
  Trash2, 
  ExternalLink,
  Save
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface AdminProductType {
  id: string;
  title: string;
  slug: string;
  sku: string;
  regularPrice: number;
  sellingPrice: number;
  costPrice?: number | null;
  sourceUrl?: string | null;
  stock: number;
  isActive: boolean;
  category: { name: string };
  brand?: { name: string } | null;
  supplier?: { name: string } | null;
  images: { url: string }[];
}

export default function ProductsManagerClient({
  initialProducts,
}: {
  initialProducts: AdminProductType[];
}) {
  const [products, setProducts] = useState<AdminProductType[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockVal, setStockVal] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartEditStock = (id: string, currentStock: number) => {
    setEditingStockId(id);
    setStockVal(currentStock);
  };

  const handleSaveStock = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(stockVal) }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stock: Number(stockVal) } : p))
        );
        setEditingStockId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search by Title, SKU, or Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/products/import"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-2xs transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-stone-500" /> Bulk CSV Import
          </Link>
          <Link
            href="/admin/products/new"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category / Brand</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Prices (Selling / MRP)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Meesho Supplier Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const img = p.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80';

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={p.title}
                            className="w-10 h-12 object-cover rounded-md bg-stone-100 shrink-0 border border-stone-200"
                          />
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="font-bold text-stone-900 hover:text-red-800 line-clamp-1 flex items-center gap-1"
                            >
                              <span>{p.title}</span>
                              <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                            </Link>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-800 block">{p.category.name}</span>
                        <span className="text-[10px] text-stone-400">{p.brand?.name || 'In-House'}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-stone-600">
                        {p.sku}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-extrabold text-stone-900 block">
                          {formatPrice(p.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-stone-400 line-through">
                          {formatPrice(p.regularPrice)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {editingStockId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={stockVal}
                              onChange={(e) => setStockVal(Number(e.target.value))}
                              className="w-16 h-7 rounded border border-stone-300 px-1.5 text-xs text-center font-bold"
                            />
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              disabled={saving}
                              className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-800"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditStock(p.id, p.stock)}
                            className={`px-2 py-0.5 rounded font-bold text-xs inline-flex items-center gap-1.5 ${
                              p.stock <= 5
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                            }`}
                            title="Click to edit stock level"
                          >
                            <span>{p.stock} units</span>
                            <Edit className="w-3 h-3 opacity-50" />
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {p.sourceUrl ? (
                          <div className="space-y-1">
                            <a
                              href={p.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-bold text-xs shadow-2xs transition-all active:scale-95"
                              title={`Direct Meesho Procurement Link for ${p.title}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-pink-600" />
                              <span>Order on Meesho ↗</span>
                            </a>
                            {p.costPrice && (
                              <span className="block text-[10px] text-stone-500 font-mono">
                                Base: ₹{(p.costPrice / 100).toFixed(0)} • Profit: +₹{((p.sellingPrice - p.costPrice) / 100).toFixed(0)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-xs">Direct Karigar</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(p.id, p.isActive)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-100 text-stone-400 border-stone-200'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Draft / Inactive'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition-colors"
                        >
                          Preview
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

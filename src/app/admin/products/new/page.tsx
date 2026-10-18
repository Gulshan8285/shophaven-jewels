'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    categoryId: '',
    brandId: '',
    supplierId: '',
    sellingPriceRupees: '',
    regularPriceRupees: '',
    stock: '50',
    description: '',
    specifications: '',
    isFeatured: false,
    isBestseller: false,
    isTrending: false,
    tags: '',
  });

  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  ]);

  const [variants, setVariants] = useState<
    { title: string; sku: string; size: string; color: string; stock: number }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories, brands, suppliers
  useEffect(() => {
    fetch('/api/admin/meta')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories[0]) {
            setFormData((prev) => ({ ...prev, categoryId: data.categories[0].id }));
          }
        }
        if (data.brands) setBrands(data.brands);
        if (data.suppliers) setSuppliers(data.suppliers);
      })
      .catch(() => {});
  }, []);

  const handleAddImage = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...imageUrls];
    updated[index] = val;
    setImageUrls(updated);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const nextNum = variants.length + 1;
    setVariants([
      ...variants,
      {
        title: `Option ${nextNum}`,
        sku: `${formData.sku ? formData.sku.toUpperCase() : 'SKU'}-VAR-${nextNum}`,
        size: 'Standard',
        color: 'Default',
        stock: 20,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.sku || !formData.sellingPriceRupees || !formData.categoryId) {
      setError('Please fill in product title, SKU, selling price, and category');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        sku: formData.sku,
        categoryId: formData.categoryId,
        brandId: formData.brandId || null,
        supplierId: formData.supplierId || null,
        regularPrice: Math.round(Number(formData.regularPriceRupees || formData.sellingPriceRupees) * 100),
        sellingPrice: Math.round(Number(formData.sellingPriceRupees) * 100),
        stock: Number(formData.stock),
        description: formData.description,
        specifications: formData.specifications,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        isTrending: formData.isTrending,
        tags: formData.tags,
        images: imageUrls.filter((url) => url.trim().length > 0),
        variants,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/products');
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch {
      setError('Network error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900">Add New Product</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <h2 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">
            General Information
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Product Title *</label>
              <Input
                required
                placeholder="e.g. Pure Georgette Chikankari Embroidered Kurta Set"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">SKU (Unique Code) *</label>
                <Input
                  required
                  placeholder="e.g. KUR-CHIK-009"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-stone-300 bg-white px-3 text-xs font-medium focus:outline-none focus:border-red-800"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Brand (Optional)</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-stone-300 bg-white px-3 text-xs font-medium focus:outline-none focus:border-red-800"
                >
                  <option value="">No Specific Brand (In-House)</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Supplier Hub (Optional)</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-stone-300 bg-white px-3 text-xs font-medium focus:outline-none focus:border-red-800"
                >
                  <option value="">Direct Sourcing Hub</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Description</label>
              <textarea
                rows={4}
                placeholder="Detailed information regarding the craftsmanship, fabric, drape, and styling suggestions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-stone-300 p-3 text-xs focus:outline-none focus:border-red-800"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Specifications (Separated by |)</label>
              <Input
                placeholder="Fabric: Pure Cotton | Fit: Regular | Wash: Hand Wash | Length: 46 inches"
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <h2 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">
            Pricing & Inventory (in INR ₹)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Selling Price (₹) *</label>
              <Input
                required
                type="number"
                min={1}
                placeholder="e.g. 899"
                value={formData.sellingPriceRupees}
                onChange={(e) => setFormData({ ...formData, sellingPriceRupees: e.target.value })}
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Regular MRP (₹)</label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 1999"
                value={formData.regularPriceRupees}
                onChange={(e) => setFormData({ ...formData, regularPriceRupees: e.target.value })}
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Total Stock Quantity *</label>
              <Input
                required
                type="number"
                min={0}
                placeholder="e.g. 50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h2 className="font-extrabold text-sm text-stone-900">Product Images (URLs)</h2>
            <button
              type="button"
              onClick={handleAddImage}
              className="text-xs font-bold text-red-800 hover:text-red-900 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Image URL
            </button>
          </div>

          <div className="space-y-3">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={url}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="text-xs flex-1"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-2 rounded-lg text-stone-400 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h2 className="font-extrabold text-sm text-stone-900">Product Variants (Sizes / Colors)</h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="text-xs font-bold text-red-800 hover:text-red-900 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No variants added. Product will use single SKU.</p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex flex-wrap gap-2 items-center text-xs">
                  <Input
                    placeholder="Title (e.g. Red / M)"
                    value={v.title}
                    onChange={(e) => {
                      const u = [...variants];
                      u[idx].title = e.target.value;
                      setVariants(u);
                    }}
                    className="w-32 text-xs"
                  />
                  <Input
                    placeholder="SKU"
                    value={v.sku}
                    onChange={(e) => {
                      const u = [...variants];
                      u[idx].sku = e.target.value.toUpperCase();
                      setVariants(u);
                    }}
                    className="w-32 font-mono text-xs"
                  />
                  <Input
                    placeholder="Size"
                    value={v.size}
                    onChange={(e) => {
                      const u = [...variants];
                      u[idx].size = e.target.value;
                      setVariants(u);
                    }}
                    className="w-20 text-xs"
                  />
                  <Input
                    placeholder="Color"
                    value={v.color}
                    onChange={(e) => {
                      const u = [...variants];
                      u[idx].color = e.target.value;
                      setVariants(u);
                    }}
                    className="w-24 text-xs"
                  />
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => {
                      const u = [...variants];
                      u[idx].stock = Number(e.target.value);
                      setVariants(u);
                    }}
                    className="w-20 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1.5 text-stone-400 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flags & Promotion Badges */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-2xs">
          <h2 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">
            Visibility & Merchandising Tags
          </h2>

          <div className="flex flex-wrap gap-6 text-xs font-semibold text-stone-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded text-red-800 focus:ring-red-800"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBestseller}
                onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                className="rounded text-red-800 focus:ring-red-800"
              />
              <span>Mark as Bestseller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="rounded text-red-800 focus:ring-red-800"
              />
              <span>Mark as Trending</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs shadow-md"
          >
            {loading ? 'Creating Product...' : 'Publish Product to Store'}
          </Button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SortSelect({ defaultValue = 'newest' }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      value={defaultValue}
      onChange={handleChange}
      className="bg-white border border-[#e6e2d8] rounded-xl text-xs font-semibold px-4 py-2 text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs cursor-pointer font-mono"
    >
      <option value="newest">Newest Arrivals</option>
      <option value="bestseller">Bestsellers</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="trending">Trending Now</option>
    </select>
  );
}

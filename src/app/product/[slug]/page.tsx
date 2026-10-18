import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import type { Metadata } from 'next';

import { getProductBySlug } from '@/lib/catalogService';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getProductBySlug(slug);

  if (!res?.product) {
    return { title: 'Product Not Found | ShopHaven' };
  }

  const { product } = res;
  const priceRupees = (product.sellingPrice / 100).toFixed(0);

  return {
    title: `${product.title} - ₹${priceRupees} | ShopHaven Direct`,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.shortDescription || product.description.slice(0, 160),
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const res = await getProductBySlug(slug);

  if (!res?.product) {
    notFound();
  }

  const { product, relatedProducts } = res;

  // Schema.org structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.map((img: any) => img.url) || [],
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'ShopHaven',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: (product.sellingPrice / 100).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'ShopHaven',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}

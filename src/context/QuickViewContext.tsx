'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface QuickViewProductData {
  id: string;
  title: string;
  slug: string;
  sku: string;
  regularPrice: number;
  sellingPrice: number;
  imageUrl?: string | null;
  brandName?: string | null;
  stock?: number;
  description?: string;
  shortDescription?: string | null;
  specifications?: string | null;
  category?: { name: string; slug: string } | null;
  brand?: { name: string; slug: string } | null;
  supplier?: { id?: string; name: string; address?: string | null } | null;
  images?: { id: string; url: string; altText?: string | null }[];
  variants?: {
    id: string;
    sku: string;
    title: string;
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
    price?: number | null;
    stock: number;
  }[];
  rating?: number;
  reviewCount?: number;
}

interface QuickViewContextType {
  isOpen: boolean;
  activeProductId: string | null;
  initialData: QuickViewProductData | null;
  openQuickView: (productId: string, initialData?: QuickViewProductData) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<QuickViewProductData | null>(null);

  const openQuickView = useCallback((productId: string, data?: QuickViewProductData) => {
    setActiveProductId(productId);
    setInitialData(data || null);
    setIsOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
    setActiveProductId(null);
    setInitialData(null);
  }, []);

  return (
    <QuickViewContext.Provider
      value={{
        isOpen,
        activeProductId,
        initialData,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}

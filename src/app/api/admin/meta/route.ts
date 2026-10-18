import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [categories, brands, suppliers] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
      prisma.brand.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
      prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({ categories, brands, suppliers });
  } catch (error) {
    console.error('Admin meta error:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}

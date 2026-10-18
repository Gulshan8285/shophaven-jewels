import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  const settings = await prisma.storeSettings.findFirst();
  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      storeName,
      email,
      phone,
      address,
      freeShippingThresholdRupees,
      standardShippingFeeRupees,
      enableCod,
      enableOnlinePayment,
      announcementBanner,
    } = body;

    const existing = await prisma.storeSettings.findFirst();
    const id = existing?.id || 'default-settings';

    const updated = await prisma.storeSettings.upsert({
      where: { id },
      update: {
        storeName,
        email,
        phone,
        address,
        freeShippingThreshold: Math.round(Number(freeShippingThresholdRupees) * 100),
        standardShippingFee: Math.round(Number(standardShippingFeeRupees) * 100),
        enableCod: Boolean(enableCod),
        enableOnlinePayment: Boolean(enableOnlinePayment),
        announcementBanner,
      },
      create: {
        id,
        storeName,
        email,
        phone,
        address,
        freeShippingThreshold: Math.round(Number(freeShippingThresholdRupees) * 100),
        standardShippingFee: Math.round(Number(standardShippingFeeRupees) * 100),
        enableCod: Boolean(enableCod),
        enableOnlinePayment: Boolean(enableOnlinePayment),
        announcementBanner,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

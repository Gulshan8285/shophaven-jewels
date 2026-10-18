import { NextResponse } from 'next/server';

const metroPrefixes: Record<string, { city: string; days: string }> = {
  '11': { city: 'Delhi NCR', days: '2-3 Business Days' },
  '12': { city: 'Gurugram / Faridabad', days: '1-2 Business Days' },
  '20': { city: 'Noida / Ghaziabad', days: '2-3 Business Days' },
  '40': { city: 'Mumbai / Thane', days: '2-3 Business Days' },
  '41': { city: 'Pune', days: '2-3 Business Days' },
  '56': { city: 'Bengaluru', days: '2-3 Business Days' },
  '50': { city: 'Hyderabad', days: '2-3 Business Days' },
  '60': { city: 'Chennai', days: '2-3 Business Days' },
  '70': { city: 'Kolkata', days: '3-4 Business Days' },
  '38': { city: 'Ahmedabad', days: '2-3 Business Days' },
  '39': { city: 'Surat', days: '2-3 Business Days' },
  '30': { city: 'Jaipur', days: '2-3 Business Days' },
  '22': { city: 'Lucknow', days: '3-4 Business Days' },
  '16': { city: 'Chandigarh', days: '2-3 Business Days' },
};

export async function POST(req: Request) {
  try {
    const { pincode } = await req.json();

    if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) {
      return NextResponse.json({
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian PIN code',
      });
    }

    const clean = String(pincode).trim();
    const prefix = clean.substring(0, 2);
    const metro = metroPrefixes[prefix];

    if (metro) {
      return NextResponse.json({
        serviceable: true,
        pincode: clean,
        city: metro.city,
        estimatedDelivery: `Delivery by ${metro.days}`,
        codAvailable: true,
        prepaidAvailable: true,
        message: `Express delivery available for ${metro.city}!`,
      });
    }

    // Standard pan-India coverage
    return NextResponse.json({
      serviceable: true,
      pincode: clean,
      city: 'Rest of India',
      estimatedDelivery: 'Standard Delivery within 4-6 Business Days',
      codAvailable: true,
      prepaidAvailable: true,
      message: 'Serviceable via Delhivery / Ekart logistics',
    });
  } catch (error) {
    console.error('Pincode check error:', error);
    return NextResponse.json({ serviceable: false, message: 'Could not verify PIN code' }, { status: 500 });
  }
}

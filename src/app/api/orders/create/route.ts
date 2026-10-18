import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { PaymentMethod, PaymentStatus, OrderStatus, DiscountType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      couponCode,
      customerDetails,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.streetAddress || !shippingAddress.postalCode) {
      return NextResponse.json({ error: 'Please provide a complete shipping address' }, { status: 400 });
    }

    // Determine user session or create guest/temp customer
    const session = await getCurrentUser();
    let userId: string;

    if (session) {
      userId = session.userId;
    } else {
      // Find or create customer account by email from checkout form
      const email = customerDetails?.email?.trim().toLowerCase();
      if (!email) {
        return NextResponse.json({ error: 'Please provide your email address' }, { status: 400 });
      }

      let existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        // Create customer with temporary random password
        const randomPass = Math.random().toString(36).substring(2, 10);
        const { hashPassword } = await import('@/lib/auth');
        const passwordHash = await hashPassword(randomPass);
        existingUser = await prisma.user.create({
          data: {
            email,
            name: customerDetails.name || shippingAddress.fullName,
            phone: customerDetails.phone || shippingAddress.phone,
            passwordHash,
            role: 'CUSTOMER',
            profile: {
              create: { loyaltyPoints: 20 },
            },
          },
        });
      }
      userId = existingUser.id;
    }

    // Recalculate everything on the server
    const productIds = items.map((i: { productId: string }) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: {
        variants: true,
        images: { orderBy: { displayOrder: 'asc' }, take: 1 },
      },
    });

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    interface ValidatedOrderItem {
      productId: string;
      variantId: string | null;
      title: string;
      sku: string;
      size: string | null;
      color: string | null;
      image: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }
    const validatedOrderItems: ValidatedOrderItem[] = [];

    for (const item of items) {
      const dbProduct = dbProductMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product no longer available: ${item.title}` }, { status: 400 });
      }

      let unitPrice = dbProduct.sellingPrice;
      let stockAvailable = dbProduct.stock;
      let sku = dbProduct.sku;
      let variantTitle = null;
      let size = null;
      let color = null;

      if (item.variantId) {
        const variant = dbProduct.variants.find((v) => v.id === item.variantId);
        if (!variant || !variant.isActive) {
          return NextResponse.json({ error: `Selected option is no longer available for ${dbProduct.title}` }, { status: 400 });
        }
        unitPrice = variant.price || dbProduct.sellingPrice;
        stockAvailable = variant.stock;
        sku = variant.sku;
        variantTitle = variant.title;
        size = variant.size;
        color = variant.color;
      }

      if (stockAvailable < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${dbProduct.title}. Only ${stockAvailable} remaining.`,
        }, { status: 400 });
      }

      const itemTotal = unitPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        productId: dbProduct.id,
        variantId: item.variantId || null,
        title: dbProduct.title,
        sku,
        size,
        color,
        image: dbProduct.images[0]?.url || item.image || '',
        unitPrice,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Server-side Coupon validation
    let discountAmount = 0;
    let validatedCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil && calculatedSubtotal >= coupon.minOrderValue) {
          if (coupon.discountType === DiscountType.PERCENTAGE) {
            discountAmount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, calculatedSubtotal);
          validatedCouponId = coupon.id;
        }
      }
    }

    // Shipping calculation
    const freeShippingThreshold = 49900; // ₹499
    const shippingFee = calculatedSubtotal >= freeShippingThreshold ? 0 : 4900;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // Generate readable order reference: SHP-2026-XXXXX
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SHP-2026-${randomSuffix}`;

    const chosenPaymentMethod =
      paymentMethod === 'ONLINE_RAZORPAY' ? PaymentMethod.ONLINE_RAZORPAY : PaymentMethod.COD;

    // Run order creation and inventory deduction in a strict Prisma transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.CONFIRMED,
          paymentMethod: chosenPaymentMethod,
          paymentStatus:
            chosenPaymentMethod === PaymentMethod.COD
              ? PaymentStatus.PENDING
              : PaymentStatus.CAPTURED, // In test mode captured, live gateway verifies signature
          subtotal: calculatedSubtotal,
          discount: discountAmount,
          shippingFee,
          total: finalTotal,
          couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
          shippingAddressSnapshot: JSON.stringify(shippingAddress),
          items: {
            create: validatedOrderItems,
          },
          payments: {
            create: [
              {
                paymentMethod: chosenPaymentMethod,
                amount: finalTotal,
                currency: 'INR',
                status:
                  chosenPaymentMethod === PaymentMethod.COD
                    ? PaymentStatus.PENDING
                    : PaymentStatus.CAPTURED,
                transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              },
            ],
          },
          shipments: {
            create: [
              {
                courierName: 'Delhivery Surface',
                trackingNumber: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                status: 'MANIFESTED',
              },
            ],
          },
        },
      });

      // 2. Decrement stock atomically and record inventory logs
      for (const item of validatedOrderItems) {
        if (item.variantId) {
          const v = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              change: -item.quantity,
              reason: 'ORDER_PLACED',
              previousStock: v.stock + item.quantity,
              newStock: v.stock,
              createdBy: 'SYSTEM_CHECKOUT',
            },
          });
        }

        const p = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: 'ORDER_PLACED',
            previousStock: p.stock + item.quantity,
            newStock: p.stock,
            createdBy: 'SYSTEM_CHECKOUT',
          },
        });
      }

      // 3. Record coupon redemption if coupon used
      if (validatedCouponId) {
        await tx.couponRedemption.create({
          data: {
            couponId: validatedCouponId,
            userId,
            orderId: newOrder.id,
            discountApplied: discountAmount,
          },
        });
        await tx.coupon.update({
          where: { id: validatedCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderNumber: createdOrder.orderNumber,
      orderId: createdOrder.id,
      total: createdOrder.total,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to process order. Please try again.' }, { status: 500 });
  }
}

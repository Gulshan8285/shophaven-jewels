import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { OrderStatus, Role } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: orderId } = await params;
    const body = await req.json();
    const { status, cancelReason, courierName, trackingNumber } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shipments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;

    // Use transaction for consistency
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. If cancelling order from active state, restore inventory
      if (status === OrderStatus.CANCELLED && previousStatus !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                change: item.quantity,
                reason: 'ORDER_CANCELLED',
                previousStock: 0,
                newStock: item.quantity,
                createdBy: session.userId,
              },
            });
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              change: item.quantity,
              reason: 'ORDER_CANCELLED',
              previousStock: 0,
              newStock: item.quantity,
              createdBy: session.userId,
            },
          });
        }
      }

      // 2. Update order record
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: status as OrderStatus,
          cancelReason: cancelReason || order.cancelReason,
        },
      });

      // 3. Update shipment if courier details provided or status changed to SHIPPED / DELIVERED
      if (courierName || trackingNumber || status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
        const existingShipment = order.shipments[0];
        if (existingShipment) {
          await tx.shipment.update({
            where: { id: existingShipment.id },
            data: {
              courierName: courierName || existingShipment.courierName,
              trackingNumber: trackingNumber || existingShipment.trackingNumber,
              status: status === OrderStatus.DELIVERED ? 'DELIVERED' : status === OrderStatus.SHIPPED ? 'IN_TRANSIT' : existingShipment.status,
              dispatchedAt: status === OrderStatus.SHIPPED ? new Date() : existingShipment.dispatchedAt,
              deliveredAt: status === OrderStatus.DELIVERED ? new Date() : existingShipment.deliveredAt,
            },
          });
        } else {
          await tx.shipment.create({
            data: {
              orderId,
              courierName: courierName || 'Delhivery',
              trackingNumber: trackingNumber || `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              status: status === OrderStatus.DELIVERED ? 'DELIVERED' : status === OrderStatus.SHIPPED ? 'IN_TRANSIT' : 'MANIFESTED',
              dispatchedAt: status === OrderStatus.SHIPPED ? new Date() : null,
              deliveredAt: status === OrderStatus.DELIVERED ? new Date() : null,
            },
          });
        }
      }

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'ORDER_STATUS_UPDATE',
          entity: 'Order',
          entityId: orderId,
          details: JSON.stringify({
            orderNumber: order.orderNumber,
            from: previousStatus,
            to: status,
            cancelReason,
            courierName,
            trackingNumber,
          }),
        },
      });

      return ord;
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

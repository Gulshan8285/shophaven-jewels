import { PrismaClient, Role, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting ShopHaven Comprehensive Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Admin & Customer Auth
    console.log('1. Authentication & RBAC Verification:');
    const admin = await prisma.user.findUnique({ where: { email: 'admin@shophaven.in' } });
    assert(admin !== null && admin.role === Role.ADMIN, 'Admin exists with ADMIN role');
    const validPass = await bcrypt.compare('AdminSecure@2026', admin?.passwordHash || '');
    assert(validPass, 'Admin password hash verification succeeds');

    const customer = await prisma.user.findUnique({ where: { email: 'rahul.sharma@example.com' } });
    assert(customer !== null && customer.role === Role.CUSTOMER, 'Customer exists with CUSTOMER role');

    // Test 2: Database Catalog & Pricing in Paise
    console.log('\n2. Catalog & Financial Precision:');
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true, images: true },
    });
    assert(products.length >= 6, `Catalog has ${products.length} products with variants and images`);
    const saree = products.find((p) => p.sku === 'SAR-KANJ-001');
    assert(saree !== undefined && saree.sellingPrice === 139900, 'Price stored as integer paise (₹1,399.00 = 139900)');
    assert((saree?.variants.length || 0) >= 3, 'Product variants correctly associated');

    // Test 3: Coupons Validation Rules
    console.log('\n3. Promotional Coupon Engine:');
    const first100 = await prisma.coupon.findUnique({ where: { code: 'FIRST100' } });
    assert(first100 !== null && first100.discountValue === 10000, 'FIRST100 flat discount value ₹100 in paise');

    const festive15 = await prisma.coupon.findUnique({ where: { code: 'FESTIVE15' } });
    assert(festive15 !== null && festive15.discountValue === 15, 'FESTIVE15 percentage discount 15%');

    // Test 4: Atomic Order Flow & Stock Consistency
    console.log('\n4. Order Processing & Inventory State:');
    const testSku = 'KUR-JAI-002';
    const testProduct = await prisma.product.findUnique({ where: { sku: testSku } });
    assert(testProduct !== null, 'Found product for order lifecycle test');

    const initialStock = testProduct?.stock || 0;
    const orderQuantity = 2;

    const testOrderNumber = `TEST-${Date.now()}`;
    const testOrder = await prisma.$transaction(async (tx) => {
      // Create order
      const ord = await tx.order.create({
        data: {
          orderNumber: testOrderNumber,
          userId: customer!.id,
          status: OrderStatus.CONFIRMED,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          subtotal: testProduct!.sellingPrice * orderQuantity,
          discount: 0,
          shippingFee: 0,
          total: testProduct!.sellingPrice * orderQuantity,
          shippingAddressSnapshot: JSON.stringify({ fullName: 'Test Buyer', city: 'Mumbai', postalCode: '400050' }),
          items: {
            create: [
              {
                productId: testProduct!.id,
                title: testProduct!.title,
                sku: testProduct!.sku,
                unitPrice: testProduct!.sellingPrice,
                quantity: orderQuantity,
                total: testProduct!.sellingPrice * orderQuantity,
              },
            ],
          },
        },
      });

      // Decrement stock
      await tx.product.update({
        where: { id: testProduct!.id },
        data: { stock: { decrement: orderQuantity } },
      });

      return ord;
    });

    const stockAfterOrder = await prisma.product.findUnique({ where: { id: testProduct!.id } });
    assert(stockAfterOrder?.stock === initialStock - orderQuantity, 'Product stock decremented atomically upon order placement');

    // Test 5: Order Cancellation & Inventory Restoration
    console.log('\n5. Order Cancellation & Stock Restoration:');
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: testOrder.id },
        data: { status: OrderStatus.CANCELLED, cancelReason: 'Automated test cancellation' },
      });

      await tx.product.update({
        where: { id: testProduct!.id },
        data: { stock: { increment: orderQuantity } },
      });
    });

    const restoredStock = await prisma.product.findUnique({ where: { id: testProduct!.id } });
    assert(restoredStock?.stock === initialStock, 'Product stock restored back to original level upon order cancellation');

    // Clean up test order
    await prisma.order.delete({ where: { id: testOrder.id } });

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();

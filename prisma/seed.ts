import { PrismaClient, Role, PaymentMethod, PaymentStatus, OrderStatus, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Store Settings
  const settings = await prisma.storeSettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      storeName: 'ShopHaven India',
      email: 'support@shophaven.in',
      phone: '+91 98765 43210',
      address: 'ShopHaven Fulfillment Hub, Sector 18, Gurugram, Haryana 122008',
      currency: 'INR',
      currencySymbol: '₹',
      freeShippingThreshold: 49900, // ₹499
      standardShippingFee: 4900,    // ₹49
      enableCod: true,
      enableOnlinePayment: true,
      returnWindowDays: 7,
      announcementBanner: '⚡ MEGA FESTIVE SALE: Extra 10% OFF with code FESTIVE15 | Free Shipping on orders over ₹499 | Cash on Delivery Available',
      policyAbout: 'ShopHaven is India’s premier value-commerce marketplace connecting verified direct-from-manufacturer suppliers with millions of smart shoppers across 28,000+ pin codes.',
      policyContact: 'Have questions or order inquiries? Reach our 24/7 care team at support@shophaven.in or WhatsApp +91 98765 43210.',
      policyFaq: '1. What are your delivery timelines? Metro cities: 2-3 business days. Rest of India: 4-6 business days.\n2. Can I pay via Cash on Delivery? Yes, COD is available for all serviceable pin codes across India.\n3. How do returns work? Enjoy hassle-free 7-day doorstep pickup return & exchange.',
      policyShipping: 'We partner with India’s leading logistics providers (Delhivery, BlueDart, Ekart) to guarantee swift and secure transit.',
      policyRefund: 'Refunds for online payments are credited to original payment source within 3-5 bank working days. For COD orders, refund is issued via instant UPI or NEFT bank transfer.',
      policyTerms: 'By placing an order on ShopHaven, you agree to our standard consumer terms and privacy standards.',
      policyPrivacy: 'We prioritize consumer data protection and never sell your personal information to third parties.',
    },
  });
  console.log('✓ Store settings initialized');

  // 2. Admin User
  const adminPasswordHash = await bcrypt.hash('AdminSecure@2026', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@shophaven.in' },
    update: { passwordHash: adminPasswordHash, role: Role.ADMIN },
    create: {
      email: 'admin@shophaven.in',
      passwordHash: adminPasswordHash,
      name: 'Gulshan Admin',
      phone: '+91 9876500001',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('✓ Admin user created: admin@shophaven.in / AdminSecure@2026');

  // 3. Customer User
  const customerPasswordHash = await bcrypt.hash('Customer@123', 12);
  const customerUser = await prisma.user.upsert({
    where: { email: 'rahul.sharma@example.com' },
    update: { passwordHash: customerPasswordHash },
    create: {
      email: 'rahul.sharma@example.com',
      passwordHash: customerPasswordHash,
      name: 'Rahul Sharma',
      phone: '+91 9811223344',
      role: Role.CUSTOMER,
      isActive: true,
      profile: {
        create: {
          loyaltyPoints: 120,
        },
      },
    },
  });

  // Customer Address
  await prisma.address.deleteMany({ where: { userId: customerUser.id } });
  const customerAddress = await prisma.address.create({
    data: {
      userId: customerUser.id,
      fullName: 'Rahul Sharma',
      phone: '+91 9811223344',
      streetAddress: 'Flat 402, Sunshine Heights, Linking Road, Bandra West',
      landmark: 'Near National College',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      country: 'India',
      isDefault: true,
      addressType: 'HOME',
    },
  });
  console.log('✓ Customer user and address created: rahul.sharma@example.com / Customer@123');

  // 4. Categories
  const categoriesData = [
    {
      name: "Women's Ethnic Wear",
      slug: 'womens-ethnic',
      description: 'Sarees, Kurtis, Anarkalis & Lehengas directly from weaver clusters',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      displayOrder: 1,
    },
    {
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Casual shirts, ethnic kurtas, t-shirts and daily essentials',
      image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
      displayOrder: 2,
    },
    {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Bedsheets, curtains, organizers, dining and modern home living',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
      displayOrder: 3,
    },
    {
      name: 'Electronics & Audio',
      slug: 'electronics-audio',
      description: 'Smartwatches, TWS earbuds, cables and mobile accessories',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      displayOrder: 4,
    },
    {
      name: 'Beauty & Wellness',
      slug: 'beauty-wellness',
      description: 'Herbal skincare, haircare, perfumes and daily grooming',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
      displayOrder: 5,
    },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoriesMap[cat.slug] = createdCat.id;
  }
  console.log('✓ Categories created');

  // 5. Brands
  const brandsData = [
    { name: 'Vedic Threads', slug: 'vedic-threads', description: 'Traditional weaving and artisan ethnic wear' },
    { name: 'Urban Stitch', slug: 'urban-stitch', description: 'Smart contemporary essentials for men & women' },
    { name: 'Aura Living', slug: 'aura-living', description: 'Comfort and elegance for your modern Indian home' },
    { name: 'Pulse Audio', slug: 'pulse-audio', description: 'High definition audio and smart wearables' },
  ];

  const brandsMap: Record<string, string> = {};
  for (const brand of brandsData) {
    const createdBrand = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    });
    brandsMap[brand.slug] = createdBrand.id;
  }
  console.log('✓ Brands created');

  // 6. Suppliers
  const suppliersData = [
    {
      name: 'Surat Textile Weavers Association',
      contactPerson: 'Manish Choksi',
      email: 'manish@suratweavers.com',
      phone: '+91 98251 12345',
      address: 'Ring Road Textile Market, Surat, Gujarat 395002',
    },
    {
      name: 'Jaipur Heritage Block Prints',
      contactPerson: 'Priyanka Shekhawat',
      email: 'crafts@jaipurprints.in',
      phone: '+91 94140 54321',
      address: 'Sanganer Industrial Area, Jaipur, Rajasthan 302029',
    },
    {
      name: 'AlphaGadgets Global Direct',
      contactPerson: 'Vikram Sethi',
      email: 'supplies@alphagadgets.in',
      phone: '+91 99100 88776',
      address: 'Okhla Phase III, New Delhi 110020',
    },
  ];

  const suppliersMap: Record<string, string> = {};
  for (const sup of suppliersData) {
    const createdSup = await prisma.supplier.create({
      data: sup,
    });
    suppliersMap[sup.name] = createdSup.id;
  }
  console.log('✓ Suppliers created');

  // 7. Products & Variants
  const productsData = [
    {
      title: 'Vedic Threads Pure Kanjivaram Soft Silk Saree with Zari Border',
      slug: 'vedic-threads-kanjivaram-soft-silk-saree',
      description: 'Indulge in royal grandeur with this handcrafted Kanjivaram soft silk saree. Features intricate floral jaal zari weaving across the pallu and a majestic golden contrast border. Comes paired with an unstitched brocade blouse piece that can be tailored up to size 44. Perfect for weddings, Diwali, Karwa Chauth, and family celebrations.',
      shortDescription: 'Lustrous soft silk saree with traditional temple zari border and matching unstitched blouse piece.',
      specifications: 'Material: Art Soft Silk | Saree Length: 5.5 Meters | Blouse Length: 0.8 Meter | Weave: Jacquard Zari | Care: Dry Clean Only | Occasion: Festive & Wedding',
      sku: 'SAR-KANJ-001',
      regularPrice: 349900, // ₹3,499.00
      sellingPrice: 139900, // ₹1,399.00 (60% OFF)
      costPrice: 75000,
      stock: 45,
      categoryId: categoriesMap['womens-ethnic'],
      brandId: brandsMap['vedic-threads'],
      supplierId: suppliersMap['Surat Textile Weavers Association'],
      isFeatured: true,
      isBestseller: true,
      isTrending: true,
      tags: 'saree,kanjivaram,silk,wedding,ethnic,diwali',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'SAR-KANJ-001-RED', title: 'Royal Crimson Red', color: 'Royal Red', colorHex: '#991b1b', size: 'Free Size', stock: 20 },
        { sku: 'SAR-KANJ-001-PEA', title: 'Peacock Blue Green', color: 'Peacock Blue', colorHex: '#0e7490', size: 'Free Size', stock: 15 },
        { sku: 'SAR-KANJ-001-MUS', title: 'Haldi Golden Yellow', color: 'Mustard Gold', colorHex: '#ca8a04', size: 'Free Size', stock: 10 },
      ],
    },
    {
      title: 'Jaipur Handblock Pure Cotton Floral Anarkali Kurti with Dupatta',
      slug: 'jaipur-handblock-anarkali-kurti-dupatta',
      description: 'Handcrafted in Sanganer using authentic wooden block printing, this 100% breathable cambric cotton Anarkali set keeps you effortlessly elegant in all seasons. Includes full flair kalidar kurti, matching cotton pants with elastic waistband, and a lightweight Mulmul dupatta with gotta patti accents.',
      shortDescription: '100% Cotton 3-Piece Anarkali set with pant and Mulmul dupatta.',
      specifications: 'Fabric: 100% Pure Cambric Cotton | Neckline: Round with V-notch | Sleeve: 3/4th Sleeves | Fit: Regular Flare | Wash Care: Hand wash separately with cold water',
      sku: 'KUR-JAI-002',
      regularPrice: 229900, // ₹2,299
      sellingPrice: 94900,  // ₹949 (59% OFF)
      costPrice: 48000,
      stock: 60,
      categoryId: categoriesMap['womens-ethnic'],
      brandId: brandsMap['vedic-threads'],
      supplierId: suppliersMap['Jaipur Heritage Block Prints'],
      isFeatured: true,
      isBestseller: true,
      isTrending: false,
      tags: 'kurti,anarkali,cotton,summer,jaipur,ethnic',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'KUR-JAI-002-S', title: 'Indigo Blue / S', color: 'Indigo Blue', colorHex: '#1e3a8a', size: 'S', stock: 15 },
        { sku: 'KUR-JAI-002-M', title: 'Indigo Blue / M', color: 'Indigo Blue', colorHex: '#1e3a8a', size: 'M', stock: 20 },
        { sku: 'KUR-JAI-002-L', title: 'Indigo Blue / L', color: 'Indigo Blue', colorHex: '#1e3a8a', size: 'L', stock: 15 },
        { sku: 'KUR-JAI-002-XL', title: 'Indigo Blue / XL', color: 'Indigo Blue', colorHex: '#1e3a8a', size: 'XL', stock: 10 },
      ],
    },
    {
      title: 'Urban Stitch Men Mandarin Collar Regular Fit Linen Cotton Kurta',
      slug: 'urban-stitch-men-mandarin-linen-cotton-kurta',
      description: 'Crafted from premium linen-cotton blend fabric, this solid long kurta delivers unmatched breathable comfort and smart styling. Styled with a classic mandarin band collar, full sleeves with roll-up tab option, two side pockets, and neat tonal buttons. Wear it casually over denim or pair with churidar for festivities.',
      shortDescription: 'Linen-cotton blend long kurta with mandarin collar and functional side pockets.',
      specifications: 'Fabric: 60% Linen, 40% Cotton | Length: Knee Length | Fit: Relaxed Regular Fit | Pockets: 2 Side Slit Pockets | Machine Washable',
      sku: 'MEN-KUR-003',
      regularPrice: 179900, // ₹1,799
      sellingPrice: 69900,  // ₹699 (61% OFF)
      costPrice: 32000,
      stock: 80,
      categoryId: categoriesMap['mens-fashion'],
      brandId: brandsMap['urban-stitch'],
      supplierId: suppliersMap['Surat Textile Weavers Association'],
      isFeatured: false,
      isBestseller: true,
      isTrending: true,
      tags: 'men,kurta,linen,cotton,casual,festive',
      images: [
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'MEN-KUR-003-NVY-M', title: 'Navy Blue / M', color: 'Navy Blue', colorHex: '#1e293b', size: 'M', stock: 25 },
        { sku: 'MEN-KUR-003-NVY-L', title: 'Navy Blue / L', color: 'Navy Blue', colorHex: '#1e293b', size: 'L', stock: 30 },
        { sku: 'MEN-KUR-003-NVY-XL', title: 'Navy Blue / XL', color: 'Navy Blue', colorHex: '#1e293b', size: 'XL', stock: 25 },
      ],
    },
    {
      title: 'Aura Living 100% Glace Cotton 240 TC King Size Bedsheet with 2 Pillow Covers',
      slug: 'aura-living-glace-cotton-king-bedsheet',
      description: 'Transform your bedroom into a peaceful sanctuary with Aura Living luxurious 240 Thread Count Glace Cotton King Size bedsheet set. Designed with fade-resistant reactive print technology, skin-friendly hypoallergenic fabric, and deep tuck-in margins that ensure the bedsheet stays wrinkle-free throughout the night.',
      shortDescription: 'Ultra-soft 240 TC King Size bedsheet (108 x 108 inches) with 2 envelope pillow covers.',
      specifications: 'Dimensions: 274 cm x 274 cm (King) | Pillow Covers: 46 cm x 69 cm | Thread Count: 240 TC | Material: Premium Glace Cotton | Non-Shrinking & Colorfast',
      sku: 'BED-AURA-004',
      regularPrice: 149900, // ₹1,499
      sellingPrice: 54900,  // ₹549 (63% OFF)
      costPrice: 28000,
      stock: 50,
      categoryId: categoriesMap['home-kitchen'],
      brandId: brandsMap['aura-living'],
      supplierId: suppliersMap['Jaipur Heritage Block Prints'],
      isFeatured: true,
      isBestseller: true,
      isTrending: false,
      tags: 'bedsheet,home,cotton,king-size,decor,pillow-covers',
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'BED-AURA-004-GEO', title: 'Geometric Teal & Beige', color: 'Teal & Beige', colorHex: '#0d9488', size: 'King (108x108 in)', stock: 25 },
        { sku: 'BED-AURA-004-FLR', title: 'Botanical Floral Sage', color: 'Sage Green', colorHex: '#84cc16', size: 'King (108x108 in)', stock: 25 },
      ],
    },
    {
      title: 'Pulse Pro 1.96" AMOLED Smartwatch with Bluetooth Calling & 120 Sports Modes',
      slug: 'pulse-pro-amoled-smartwatch-bt-calling',
      description: 'Stay connected and on track with the Pulse Pro. Features an ultra-bright 1.96-inch curved AMOLED display with Always-On capability, crystal clear dual-microphone Bluetooth calling with noise cancellation, continuous 24/7 SpO2 and heart rate bio-sensors, and an incredible 8-day battery life.',
      shortDescription: '1.96" AMOLED Always-On Display, Bluetooth HD Calling, IP68 Waterproof, 8-Day Battery.',
      specifications: 'Display: 1.96" AMOLED (410x502 px, 800 nits) | Connectivity: Bluetooth 5.3 BLE | Battery: 320 mAh (Up to 8 days normal use) | Sensors: Optical Heart Rate, SpO2, Sleep Tracker | Water Resistance: IP68',
      sku: 'WAT-PULSE-005',
      regularPrice: 499900, // ₹4,999
      sellingPrice: 179900, // ₹1,799 (64% OFF)
      costPrice: 95000,
      stock: 35,
      categoryId: categoriesMap['electronics-audio'],
      brandId: brandsMap['pulse-audio'],
      supplierId: suppliersMap['AlphaGadgets Global Direct'],
      isFeatured: true,
      isBestseller: true,
      isTrending: true,
      tags: 'smartwatch,amoled,calling,fitness,bluetooth,pulse',
      images: [
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'WAT-PULSE-005-BLK', title: 'Midnight Obsidian Black', color: 'Midnight Black', colorHex: '#09090b', size: 'Standard', stock: 20 },
        { sku: 'WAT-PULSE-005-SLV', title: 'Starlight Silver with Orange Strap', color: 'Starlight Silver', colorHex: '#e2e8f0', size: 'Standard', stock: 15 },
      ],
    },
    {
      title: 'PulsePods ANC Active Noise Cancelling True Wireless Earbuds with 45H Playtime',
      slug: 'pulsepods-anc-true-wireless-earbuds',
      description: 'Immerse yourself in rich, studio-grade acoustics. PulsePods ANC features active noise cancellation up to 32dB, 13mm composite titanium drivers for deep bass, ultra-low latency 45ms gaming mode, and rapid fast charging (10 mins charge = 3 hours playback).',
      shortDescription: '32dB Active Noise Cancellation, 13mm Bass Drivers, 45H Battery, Quad Mic ENC.',
      specifications: 'Driver: 13mm Dynamic Titanium | ANC Depth: Up to 32dB | Bluetooth: v5.4 | Total Playtime: 45 Hours with Type-C Case | Water Protection: IPX5 Splashproof',
      sku: 'EAR-PULSE-006',
      regularPrice: 349900, // ₹3,499
      sellingPrice: 129900, // ₹1,299 (63% OFF)
      costPrice: 65000,
      stock: 40,
      categoryId: categoriesMap['electronics-audio'],
      brandId: brandsMap['pulse-audio'],
      supplierId: suppliersMap['AlphaGadgets Global Direct'],
      isFeatured: false,
      isBestseller: false,
      isTrending: true,
      tags: 'earbuds,tws,anc,audio,bluetooth,music,bass',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'EAR-PULSE-006-WHT', title: 'Glacier Pure White', color: 'Pure White', colorHex: '#ffffff', size: 'One Size', stock: 25 },
        { sku: 'EAR-PULSE-006-BLK', title: 'Matte Space Black', color: 'Space Black', colorHex: '#18181b', size: 'One Size', stock: 15 },
      ],
    },
  ];

  for (const prod of productsData) {
    const { images, variants, ...productFields } = prod;

    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: productFields,
      create: productFields,
    });

    // Images
    await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: images[i],
          isPrimary: i === 0,
          displayOrder: i,
          altText: `${createdProduct.title} - Image ${i + 1}`,
        },
      });
    }

    // Variants
    await prisma.productVariant.deleteMany({ where: { productId: createdProduct.id } });
    for (const v of variants) {
      await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: v.sku,
          title: v.title,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          stock: v.stock,
          price: createdProduct.sellingPrice,
        },
      });
    }

    // Connect SupplierProduct
    if (prod.supplierId) {
      await prisma.supplierProduct.upsert({
        where: { productId: createdProduct.id },
        update: {
          supplierSku: prod.sku,
          supplierPrice: prod.costPrice || prod.sellingPrice,
        },
        create: {
          supplierId: prod.supplierId,
          productId: createdProduct.id,
          supplierSku: prod.sku,
          supplierPrice: prod.costPrice || prod.sellingPrice,
          syncStatus: 'SYNCED',
        },
      });
    }
  }
  console.log('✓ Products, images and variants created');

  // 8. Coupons
  const couponsData = [
    {
      code: 'FIRST100',
      description: 'Flat ₹100 discount on your first order above ₹499',
      discountType: DiscountType.FIXED,
      discountValue: 10000, // ₹100 in paise
      minOrderValue: 49900, // ₹499 in paise
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isActive: true,
      maxUses: 1000,
    },
    {
      code: 'FESTIVE15',
      description: 'Get 15% discount up to ₹300 on orders above ₹999',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      maxDiscount: 30000, // ₹300 max
      minOrderValue: 99900, // ₹999 in paise
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      maxUses: 5000,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log('✓ Coupons created');

  // 9. Verified Sample Reviews
  const firstProduct = await prisma.product.findFirst({ where: { slug: 'vedic-threads-kanjivaram-soft-silk-saree' } });
  if (firstProduct) {
    await prisma.review.deleteMany({ where: { productId: firstProduct.id } });
    await prisma.review.createMany({
      data: [
        {
          productId: firstProduct.id,
          userId: customerUser.id,
          customerName: 'Pooja Verma',
          rating: 5,
          title: 'Stunning quality, looks far more expensive!',
          comment: 'The saree shine and zari border are immaculate. Wore it to my cousin wedding and received endless compliments. Packaging was neat and delivered within 3 days in Lucknow.',
          verifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: firstProduct.id,
          userId: customerUser.id,
          customerName: 'Sunita Patel',
          rating: 5,
          title: 'Soft fabric and rich pallu work',
          comment: 'Very lightweight and easy to drape all day. Blouse piece has plenty of fabric for a designer cut.',
          verifiedPurchase: true,
          isApproved: true,
        },
      ],
    });
  }

  // 10. Sample Realistic Orders to populate Admin Dashboard & Customer Order History
  const saree = await prisma.product.findUnique({
    where: { slug: 'vedic-threads-kanjivaram-soft-silk-saree' },
    include: { variants: true },
  });
  const bedsheet = await prisma.product.findUnique({
    where: { slug: 'aura-living-glace-cotton-king-bedsheet' },
    include: { variants: true },
  });

  if (saree && bedsheet) {
    // Delivered order
    const order1Number = 'SHP-2026-9812';
    const existingOrder1 = await prisma.order.findUnique({ where: { orderNumber: order1Number } });
    if (!existingOrder1) {
      const order1 = await prisma.order.create({
        data: {
          orderNumber: order1Number,
          userId: customerUser.id,
          status: OrderStatus.DELIVERED,
          paymentMethod: PaymentMethod.ONLINE_RAZORPAY,
          paymentStatus: PaymentStatus.CAPTURED,
          subtotal: saree.sellingPrice,
          discount: 10000, // ₹100
          shippingFee: 0,
          total: saree.sellingPrice - 10000,
          couponCode: 'FIRST100',
          shippingAddressSnapshot: JSON.stringify(customerAddress),
          items: {
            create: [
              {
                productId: saree.id,
                variantId: saree.variants[0]?.id,
                title: saree.title,
                sku: saree.variants[0]?.sku || saree.sku,
                size: saree.variants[0]?.size || 'Free Size',
                color: saree.variants[0]?.color || 'Royal Red',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
                unitPrice: saree.sellingPrice,
                quantity: 1,
                total: saree.sellingPrice,
              },
            ],
          },
          payments: {
            create: [
              {
                paymentMethod: PaymentMethod.ONLINE_RAZORPAY,
                amount: saree.sellingPrice - 10000,
                status: PaymentStatus.CAPTURED,
                transactionId: 'pay_rzp_mock_981203',
                gatewayOrderId: 'order_rzp_mock_981203',
              },
            ],
          },
          shipments: {
            create: [
              {
                trackingNumber: 'DEL-9928172635',
                courierName: 'Delhivery Surface',
                status: 'DELIVERED',
                dispatchedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              },
            ],
          },
        },
      });
    }

    // Pending / Processing COD order
    const order2Number = 'SHP-2026-9813';
    const existingOrder2 = await prisma.order.findUnique({ where: { orderNumber: order2Number } });
    if (!existingOrder2) {
      await prisma.order.create({
        data: {
          orderNumber: order2Number,
          userId: customerUser.id,
          status: OrderStatus.CONFIRMED,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          subtotal: bedsheet.sellingPrice,
          discount: 0,
          shippingFee: 0, // Free shipping threshold met
          total: bedsheet.sellingPrice,
          shippingAddressSnapshot: JSON.stringify(customerAddress),
          items: {
            create: [
              {
                productId: bedsheet.id,
                variantId: bedsheet.variants[0]?.id,
                title: bedsheet.title,
                sku: bedsheet.variants[0]?.sku || bedsheet.sku,
                size: bedsheet.variants[0]?.size || 'King',
                color: bedsheet.variants[0]?.color || 'Teal',
                image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
                unitPrice: bedsheet.sellingPrice,
                quantity: 1,
                total: bedsheet.sellingPrice,
              },
            ],
          },
          shipments: {
            create: [
              {
                trackingNumber: 'EKART-88271019',
                courierName: 'Ekart Logistics',
                status: 'MANIFESTED',
              },
            ],
          },
        },
      });
    }
  }
  console.log('✓ Realistic seed orders created for metrics and customer history');

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

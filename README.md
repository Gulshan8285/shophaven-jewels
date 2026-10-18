# ShopHaven India — Premium E-Commerce Store with Complete Admin Panel

ShopHaven is a full-stack, production-grade Indian e-commerce platform built on Next.js 16 (App Router), TypeScript, Tailwind CSS, PostgreSQL, and Prisma ORM. It combines the convenience and manufacturer-direct pricing of platforms like Meesho with the polish and trust of modern Indian retail brands (Tata CliQ, Nykaa).

---

## 🌟 Key Features

### 🛒 1. Customer Storefront
- **Festive Announcement & Sourcing Bar**: Dynamic top bar with live offers, free shipping progress notifications, and fast navigation.
- **Hero & Curated Collections**: High-impact promotional banners, weaver cluster storytelling, and trust badges.
- **Interactive Mega Catalog & Filters**:
  - Filter by Category (Women's Ethnic, Men's Fashion, Home & Kitchen, Electronics & Audio, Beauty & Wellness).
  - Price Range filters (Under ₹699, ₹700–₹1,499, ₹1,500+).
  - Brand & Supplier filter tags.
  - Sorting by Newest, Price (Low to High / High to Low), Bestsellers, and Trending.
- **Rich Product Details Page (PDP)**:
  - Multi-image gallery with zoom thumbnails.
  - Size and color variant selector updating SKU, stock, and prices dynamically.
  - Indian 6-Digit PIN Code Serviceability Checker (Major metros: 2–3 days delivery; Pan-India coverage: 4–6 days).
  - Specifications table and verified customer reviews with ratings.
  - Sticky mobile Add-to-Cart and Buy-Now buttons.
- **Shopping Cart & Coupon Engine**:
  - Real-time quantity adjustments and item removals.
  - Free Shipping Progress Meter (Dynamic threshold calculation at ₹499).
  - Live Coupon validation against cart subtotal (`FIRST100` for flat ₹100 off; `FESTIVE15` for 15% off up to ₹300).
- **Checkout & Order Creation**:
  - Customer contact details and Indian delivery address with PIN code validation.
  - Payment modes: **Cash on Delivery (COD)** and **Online Payments (UPI, Cards, NetBanking, Razorpay)**.
  - **Server-Side Security**: All prices, discounts, and inventory quantities are strictly re-verified on the server.
- **Order Tracking & Confirmation**:
  - Visual milestone timeline (Confirmed → Packing & QC → Dispatched → Delivered).
  - Logistics tracking with Courier Partner and Consignment AWB numbers.
- **Customer Account Portal**:
  - Profile overview, saved addresses, and loyalty rewards points.
  - Complete order history with invoice breakdown and status badges.

---

### 🛡️ 2. Comprehensive Admin Panel (`/admin`)
- **Dashboard & Business Analytics**:
  - Real database metrics: Total Orders, Today's Orders, Fulfilled Sales (in INR), In-Transit Shipments, and Low Stock Alerts.
  - Visual fulfillment pipeline breakdown (Pending, Confirmed, Shipped, Delivered, Cancelled).
  - Recent live orders queue and bestselling products.
- **Order Management & Fulfillment**:
  - Filter orders by status (Pending, Confirmed, Packed, Shipped, Delivered, Cancelled) or search by Order ID / Customer.
  - **Fulfillment Workflow**: Confirm Order → Mark Packed → Assign Courier (Delhivery, BlueDart, Ekart, Shadowfax) & AWB Tracking Number → Mark Delivered.
  - **Automated Stock Restoration**: Cancelling an order restores inventory levels in PostgreSQL and creates an `InventoryLog`.
  - **Audit Logging**: Every status transition records an `AuditLog` entry tracking user ID, previous status, new status, and timestamp.
  - Print order invoices directly from the browser.
- **Product & Inventory Management**:
  - Add single products with image URLs, categories, brands, suppliers, specifications, and variant matrices.
  - Inline fast stock adjustment with instant database synchronization.
  - Active/Inactive visibility toggle.
- **Bulk CSV Catalog Importer**:
  - Upload CSV product catalogs directly from suppliers.
  - Downloadable standardized sample CSV template (`shophaven_products_sample.csv`).
  - Browser-side preview table and row validation.
  - Duplicate SKU detection and detailed error logging for rejected rows.
- **Supplier & Catalog Management**:
  - Supplier directory with contact persons, phone numbers, emails, addresses, and mapped product counts.
- **Customer Management**:
  - View registered buyers, order histories, phone numbers, and loyalty points.
- **Coupon & Promotion Engine**:
  - Create promotional codes (percentage or flat discount, minimum order value, max discount cap, validity duration).
- **Store Configuration**:
  - Update store name, support email, phone, physical hub address, free delivery thresholds, and payment switches.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL 16 (Docker container `ecom-pg`) |
| **ORM** | Prisma 6.4.1 |
| **Auth** | Jose (JWT) + Bcryptjs with HTTP-only Cookies |
| **Icons** | Lucide React |
| **CSV Processing** | PapaParse |
| **Testing** | Custom automated integration test suite |

---

## 🚀 Quick Start Guide

### 1. Database Setup
A PostgreSQL 16 instance runs locally via Docker:
```bash
# Verify PostgreSQL container is running
docker ps
# If needed, run postgres container:
docker run --name ecom-pg -e POSTGRES_USER=ecom -e POSTGRES_PASSWORD=ecom123 -e POSTGRES_DB=ecom -p 5432:5432 -d postgres:16
```

### 2. Environment Configuration
Create or verify `.env`:
```env
DATABASE_URL="postgresql://ecom:ecom123@localhost:5432/ecom?schema=public"
JWT_SECRET="ecom-super-secret-jwt-token-key-replace-in-prod-xyz987"
NEXT_PUBLIC_STORE_NAME="ShopHaven India"
NEXT_PUBLIC_STORE_CURRENCY="INR"
NEXT_PUBLIC_STORE_CURRENCY_SYMBOL="₹"
```

### 3. Database Migration & Seed
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed initial store settings, admin, customer, categories, brands, suppliers, products, coupons & sample orders
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** (or port 3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Store Admin** | `admin@shophaven.in` | `AdminSecure@2026` | `/admin` & Storefront |
| **Customer** | `rahul.sharma@example.com` | `Customer@123` | Storefront & `/account` |

*(Quick one-click login presets are also available on the login page for instant testing).*

---

## 🧪 Automated Testing
Run the comprehensive integration test suite:
```bash
npx tsx tests/smoke-test.ts
```
Tests:
- Admin & Customer authentication & role-based access control (RBAC).
- Catalog pricing integrity in integer minor units (paise).
- Coupon discount engine calculations (flat and percentage caps).
- Atomic order placement with stock deduction.
- Order cancellation with automatic inventory restoration.

### Production Build Validation
```bash
npm run build
```
Generates 44 optimized static and dynamic routes with zero TypeScript or lint errors.

---

## 📄 License & Ownership
Copyright © 2026 ShopHaven India Commerce Pvt Ltd. All rights reserved.

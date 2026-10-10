# 🛍️ Ahti Shopping Store - Modern Pakistani Online Store

A complete, full-stack, responsive e-commerce web application built with **React**, **TypeScript**, **Express**, **Tailwind CSS**, and **Supabase / PostgreSQL** schema compatibility.

Designed specifically for online shopping in Pakistan with real PKR currency, local payment options (**Cash on Delivery, JazzCash, Easypaisa, and Bank Transfer**), server-side total recalculation, inventory management, customer order tracking, and a comprehensive protected admin dashboard.

---

## 🚀 Key Features

- **Storefront & Product Catalog**:
  - Live product search, multi-category filtering, price sliders, and sorting (Price, Rating, Newest, Most Popular).
  - All prices natively displayed in Pakistani Rupees (**PKR / Rs.**).
  - Accurate stock availability indicators (**In Stock, Low Stock Alert, Out of Stock**).
  - Multi-image gallery with high-resolution product thumbnails.
  - Verified customer reviews & ratings.
  - Active coupons with real promo codes: `WELCOME10` (10% off), `AHTI500` (PKR 500 flat off), `RAMADAN20` (20% off).
  - Nationwide shipping calculator with **Free Delivery threshold at PKR 5,000+**.

- **Pakistani Payment Options & Manual Verification**:
  - **Cash on Delivery (COD)**: For doorstep parcel payment across 100+ cities.
  - **JazzCash Mobile Account**: Displays merchant account number and instructions dynamically; collects customer Transaction ID (TID).
  - **Easypaisa Wallet**: Instructions with 11-digit TRX ID collection.
  - **Bank Transfer (IBAN)**: Meezan Bank / 1Link Raast transfer instructions.
  - **Strict Security**: Payments are **never automatically marked as paid** without administrator verification. Orders are set to `Verification Pending` until store admins verify the bank or telecom receipt.

- **Customer Dashboard**:
  - Customer registration fields: Full Name, Email, Phone, Password, Country (no CNIC requested).
  - Order timeline: `Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` → `Cancelled` → `Refunded`.
  - Order cancellation where permitted (while `Pending` or `Confirmed`).
  - Submit or update payment Transaction IDs directly from order details.
  - Saved delivery addresses management.
  - Personal wishlist with one-click "Move to Cart".
  - Profile details editor and password change with current password validation.

- **Protected Admin Dashboard**:
  - Accessible only to accounts with `role === 'admin'`.
  - **Verified Sales Metric**: Strictly counts revenue from verified/paid orders only (excluding pending or cancelled).
  - Product Inventory management (Add product with images, SKU, category, stock, and prices).
  - Order status workflow updater.
  - Payment verification tool (Approve or Reject payment with reason notes).
  - Customer account directory (passwords never exposed).
  - Coupon code generator and discount manager.
  - Store payment details configuration (change JazzCash, Easypaisa, or bank account numbers anytime).
  - One-click **Export Orders to CSV**.

---

## 🔐 Initial Development Admin Credentials

An initial development admin account is automatically initialized securely on server startup using salted `bcrypt` password hashing:

- **Email**: `ahti01@gmail.com`
- **Password**: `ahtisham@1`
- **Role**: `admin` (enforced server-side)

> ⚠️ **CRITICAL SECURITY NOTE FOR PUBLIC LAUNCH**:
> 1. Treat these credentials as initial development setup values only.
> 2. Log in to the Admin Dashboard and change this initial password before making the store publicly accessible to end customers.
> 3. Passwords are never sent in plain-text or exposed in frontend code.

---

## 🛠️ Local Development in VS Code

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation Steps
```bash
# Clone the repository
git clone <your-repo-url>
cd ahti-shopping-store

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### 3. Start Development Server
```bash
# Starts Express backend and Vite middleware on port 3000
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## ☁️ Running on Google AI Studio

1. Open your workspace in Google AI Studio Build.
2. The runtime automatically runs `tsx server.ts` on port 3000.
3. Access the development preview URL directly.
4. If you make modifications, verify with `npm run build` or `npm run lint`.

---

## 🗄️ Database Schema & Supabase Setup

The codebase includes an all-inclusive production SQL migration file: `supabase-schema.sql`.

To use Supabase for production:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste the contents of `supabase-schema.sql` and run it.
4. It sets up all tables with primary keys, foreign keys, timestamps, indexes, and Row Level Security (RLS) policies:
   - `profiles`
   - `products`
   - `categories`
   - `cart_items`
   - `orders`
   - `order_items`
   - `payments`
   - `addresses`
   - `reviews`
   - `wishlists`
   - `coupons`
   - `store_settings`

---

## 📦 Production Build & Deployment

### Build the Application:
```bash
npm run build
```
This bundles the React SPA into the `dist/` directory.

### Run in Production Mode:
```bash
NODE_ENV=production npm start
```
The server serves the compiled `dist/` static assets alongside the production Express API endpoints on port 3000.

---

## ❓ Troubleshooting Guide

1. **Port 3000 in use**:
   - Change the port in `.env` by setting `PORT=3001` or terminate the conflicting process.
2. **Admin login issues**:
   - Verify you are using `ahti01@gmail.com` and `ahtisham@1`.
   - On the Sign In page, use the **"Fill Admin Credentials"** helper button to prefill the development credentials.
3. **Product Stock Out warning**:
   - If a product shows "Out of Stock", log in as Admin, navigate to **Inventory**, click **Edit**, and update the stock units.
4. **Order totals mismatch**:
   - The server enforces authoritative recalculation of all subtotals, coupons, and shipping fees. Client-manipulated prices are rejected.

# HomeBite — Home-Made Food Marketplace

A full-stack mobile application connecting home cooks (Vendors) with customers. Built with Node.js + Express on the backend and React Native (Expo) on the frontend.

---

## Project Structure

```
home-made-foodies/
├── homebite-backend/     # Node.js + Express + Prisma API
└── homebite-app/         # React Native (Expo Router) app
```

---

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Backend     | Node.js, Express.js                               |
| Database    | PostgreSQL                                        |
| ORM         | Prisma                                            |
| Auth        | JWT (access + refresh token rotation)             |
| Frontend    | React Native, Expo (SDK 51), Expo Router v3       |
| State       | Zustand                                           |
| Forms       | React Hook Form + Zod                             |
| HTTP Client | Axios (with 401 auto-refresh interceptor)         |
| Payments    | Razorpay (stub — ready for live integration)      |
| Delivery    | Shiprocket (stub — ready for live integration)    |

---

## Roles

| Role     | Capabilities                                                             |
|----------|--------------------------------------------------------------------------|
| Customer | Browse vendors, add to cart, place orders, track order status            |
| Vendor   | Onboard kitchen, manage menu, accept/update orders                       |
| Admin    | Approve/reject vendors, manage users, view all orders & revenue          |

---

## Core Features

- JWT auth with access token (15 min) + refresh token (7 days) rotation
- Role-based access control across all API routes
- Vendor onboarding → admin approval workflow
- Single-vendor cart enforcement
- Order item price snapshots (historical accuracy)
- Order status machine with vendor-driven transitions
- Razorpay payment stub (signature verification structure in place)
- Shiprocket delivery stub (AWB/tracking structure in place)
- File upload for food item images (Multer)
- Review system (only for delivered orders)
- Pagination on all list endpoints

---

## Getting Started

### Backend

```bash
cd homebite-backend

# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT secrets

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Seed with sample data
npm run prisma:seed

# 5. Start dev server
npm run dev
# API running at http://localhost:5000
```

### Frontend

```bash
cd homebite-app

# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000/api/v1
# (Use your machine's LAN IP, not localhost, for device testing)

# 3. Start Expo
npm start
# Scan QR with Expo Go app on Android/iOS
```

---

## API Base URL

```
http://localhost:5000/api/v1
```

### Key Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register (CUSTOMER or VENDOR) |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |
| POST | `/vendors/onboard` | Vendor onboarding |
| GET | `/vendors` | List approved vendors |
| GET | `/vendors/:id` | Vendor detail + menu |
| POST | `/food-items` | Vendor: add food item |
| GET | `/cart` | Get cart |
| POST | `/cart/items` | Add to cart |
| POST | `/orders` | Place order |
| GET | `/orders` | Customer order history |
| GET | `/orders/vendor/incoming` | Vendor incoming orders |
| PATCH | `/orders/:id/status` | Vendor update order status |
| PATCH | `/admin/vendors/:id/approve` | Admin approve vendor |
| GET | `/admin/dashboard` | Admin stats |

---

## Database Schema Overview

```
User ─── Vendor ─── FoodItem ─── CartItem ─── Cart
  │          └────── Order ──────── OrderItem
  │                      └──── Payment
  │                      └──── Delivery
  └────── Review
  └────── Address
```

---

## Seed Credentials

After running `npm run prisma:seed`:

| Role     | Email                 | Password      |
|----------|-----------------------|---------------|
| Admin    | admin@homebite.com    | Admin@123     |
| Customer | customer@test.com     | Customer@123  |
| Vendor   | vendor@test.com       | Vendor@123    |

The test vendor is pre-approved with 3 sample food items.

---

## Payment Integration (Razorpay)

The payment flow is stubbed but fully structured. To go live:

1. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`
2. In `payment.service.js`, replace stub `createOrder()` with `razorpay.orders.create()`
3. In `verifyPayment()`, uncomment the signature verification block
4. In the frontend checkout screen, launch Razorpay SDK after order creation

---

## Delivery Integration (Shiprocket)

Fully stubbed in `delivery.service.js`. To go live:

1. Add `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` to `.env`
2. Replace stub methods with Shiprocket REST API calls
3. Auth token: `POST https://apiv2.shiprocket.in/v1/external/auth/local`

---

## Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://user:pass@localhost:3306/homebite_db"
JWT_ACCESS_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
```

### Frontend (`.env`)
```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api/v1
```

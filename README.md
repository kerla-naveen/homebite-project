# HomeBite – Home-Made Food Marketplace Platform

> Connecting home cooks with customers who crave authentic, home-made meals.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Architecture Diagram](#architecture-diagram)
- [Project Folder Structure](#project-folder-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Mobile App Setup](#mobile-app-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints Overview](#api-endpoints-overview)
- [Database Schema Overview](#database-schema-overview)
- [Order Flow](#order-flow)
- [Future Improvements](#future-improvements)
- [Deployment Plan](#deployment-plan)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

HomeBite is a full-stack mobile marketplace platform that bridges the gap between talented home cooks and customers who want real, home-made food — not just another restaurant delivery app.

### The Problem

Restaurants dominate food delivery, but millions of people crave authentic home-cooked meals — the kind made with personal recipes, fresh ingredients, and genuine care. At the same time, skilled home cooks have no easy way to monetize their passion and reach hungry customers nearby.

### The Solution

HomeBite gives home cooks a vendor storefront to list their dishes, set prices, and manage orders — while customers can browse nearby vendors, explore menus, place orders, and track deliveries. An admin panel ensures quality control through a vendor approval workflow.

---

## Key Features

### Customer Features
- Register and log in securely (JWT-based auth with token rotation)
- Browse approved vendors and their menus
- Filter food items by dietary tags (Veg, Non-Veg, Vegan, Jain, Gluten-Free)
- Add items from a single vendor to cart (single-vendor cart enforcement)
- Manage multiple delivery addresses
- Place orders and make payments via Razorpay
- Track order status in real time (Confirmed → Preparing → Out for Delivery → Delivered)
- View full order history with item snapshots
- Leave reviews and ratings for vendors and food items

### Vendor Features
- Register as a vendor and go through an admin approval flow
- Create and manage a food menu (add, edit, remove items with images)
- Accept or reject incoming customer orders
- Update order status as preparation progresses
- View order history and earnings dashboard

### Admin Features
- Review and approve or reject vendor registrations
- Suspend vendors in violation of platform policy
- View and manage all platform users
- Monitor all orders across the platform
- View analytics: users, orders, and revenue

---

## System Architecture

HomeBite follows a **client-server architecture** with three main layers:

1. **Mobile Client (React Native / Expo)**
   - Built with Expo Router for file-based navigation
   - Communicates with the backend exclusively via REST API
   - Manages local state with Zustand; persists tokens securely with `expo-secure-store`
   - Role-based routing: CUSTOMER, VENDOR, and ADMIN each get their own screen stack

2. **Backend API (Node.js / Express)**
   - RESTful API organized into feature modules (auth, vendors, food-items, orders, payments, delivery, reviews, admin)
   - Stateless: each request is authenticated with a short-lived JWT access token (15 min) backed by a rotating refresh token (7 days)
   - Razorpay handles payment order creation and webhook verification
   - Shiprocket handles shipment creation and delivery tracking
   - Multer handles food item image uploads stored locally (cloud migration planned)

3. **Database (MySQL / Prisma ORM)**
   - Prisma ORM provides type-safe database access and migration management
   - Relational schema models Users, Vendors, FoodItems, Cart, Orders, Payments, Deliveries, and Reviews
   - Order items snapshot the item name and price at placement time to prevent historical data corruption

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  HomeBite Mobile App                    │
│              React Native + Expo Router                 │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   │
│  │ (customer)│  │ (vendor)  │  │     (admin)       │   │
│  │  Screens  │  │  Screens  │  │     Screens       │   │
│  └───────────┘  └───────────┘  └───────────────────┘   │
│         │              │                  │             │
│  ┌──────▼──────────────▼──────────────────▼──────┐      │
│  │       Zustand Store  +  Axios Client           │      │
│  └──────────────────────┬─────────────────────────┘      │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS / REST API
                          │
┌─────────────────────────▼───────────────────────────────┐
│               HomeBite Backend API                      │
│              Node.js + Express.js                       │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Auth   │ │ Vendors │ │  Orders  │ │    Admin    │  │
│  │ Module  │ │ Module  │ │  Module  │ │   Module    │  │
│  └─────────┘ └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Cart   │ │  Food   │ │ Payments │ │  Delivery   │  │
│  │ Module  │ │  Items  │ │ Module   │ │   Module    │  │
│  └─────────┘ └─────────┘ └──────────┘ └─────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │       Middleware: JWT Auth, RBAC, Validation,   │   │
│  │       Rate Limiting, Helmet, CORS, Morgan       │   │
│  └─────────────────────────────────────────────────┘   │
└────────────┬───────────────────┬────────────────────────┘
             │                   │
     ┌───────▼───────┐   ┌───────▼──────────────────┐
     │  MySQL DB     │   │   External Services       │
     │  Prisma ORM   │   │                          │
     │               │   │  ┌───────────────────┐   │
     │  Users        │   │  │  Razorpay (Pay)   │   │
     │  Vendors      │   │  └───────────────────┘   │
     │  FoodItems    │   │  ┌───────────────────┐   │
     │  Orders       │   │  │ Shiprocket (Ship) │   │
     │  Payments     │   │  └───────────────────┘   │
     │  Deliveries   │   └──────────────────────────┘
     │  Reviews      │
     └───────────────┘
```

---

## Project Folder Structure

```
home-made-foodies/
├── homebite-backend/               # Node.js + Express REST API
│   ├── src/
│   │   ├── server.js               # Entry point — starts HTTP server
│   │   ├── app.js                  # Express app, middleware, route mounting
│   │   ├── config/
│   │   │   ├── database.js         # Prisma client singleton
│   │   │   ├── jwt.js              # JWT config (secrets, expiry)
│   │   │   ├── razorpay.js         # Razorpay SDK init
│   │   │   └── shiprocket.js       # Shiprocket credentials
│   │   ├── middleware/
│   │   │   ├── auth.js             # Verify JWT, attach user to request
│   │   │   ├── roleGuard.js        # Role-based access control
│   │   │   ├── validate.js         # Joi schema request validation
│   │   │   ├── upload.js           # Multer file upload config
│   │   │   └── errorHandler.js     # Global error handler
│   │   ├── modules/
│   │   │   ├── auth/               # register, login, refresh token, /me
│   │   │   ├── users/              # profile, address CRUD
│   │   │   ├── vendors/            # vendor registration & profile
│   │   │   ├── categories/         # food categories
│   │   │   ├── food-items/         # menu item CRUD + image upload
│   │   │   ├── cart/               # cart management
│   │   │   ├── orders/             # order lifecycle management
│   │   │   ├── payments/           # Razorpay order + verify + webhook
│   │   │   ├── delivery/           # Shiprocket shipment + tracking
│   │   │   ├── reviews/            # ratings & reviews
│   │   │   └── admin/              # vendor approval, analytics
│   │   └── utils/
│   │       ├── apiResponse.js      # Standardized success/error responses
│   │       ├── asyncHandler.js     # Wrap async controllers, catch errors
│   │       ├── constants.js        # Roles, order/payment/delivery statuses
│   │       ├── generateToken.js    # JWT access + refresh token generation
│   │       ├── hashPassword.js     # bcrypt hash & compare
│   │       └── paginate.js         # Cursor/offset pagination helper
│   ├── prisma/
│   │   ├── schema.prisma           # Full database schema
│   │   └── seed.js                 # Seeds admin, customer, vendor accounts
│   ├── uploads/                    # Local food image storage
│   ├── .env.example
│   └── package.json
│
└── homebite-app/                   # React Native + Expo mobile app
    ├── app/                        # Expo Router (file-based routing)
    │   ├── _layout.tsx             # Root layout — auth check + role-based redirect
    │   ├── (auth)/
    │   │   ├── login.tsx
    │   │   └── register.tsx
    │   ├── (customer)/
    │   │   ├── index.tsx           # Home / vendor listing
    │   │   ├── cart.tsx
    │   │   ├── checkout.tsx
    │   │   ├── profile.tsx
    │   │   ├── orders/
    │   │   │   ├── index.tsx       # Order history
    │   │   │   └── [id].tsx        # Order detail + status tracker
    │   │   └── vendors/
    │   │       ├── index.tsx       # Browse vendors
    │   │       └── [id].tsx        # Vendor menu
    │   ├── (vendor)/
    │   │   ├── dashboard.tsx
    │   │   ├── onboarding.tsx
    │   │   ├── orders/
    │   │   │   ├── index.tsx
    │   │   │   └── [id].tsx
    │   │   └── menu/
    │   │       ├── index.tsx
    │   │       ├── create.tsx
    │   │       └── [id]/edit.tsx
    │   └── (admin)/
    │       ├── dashboard.tsx
    │       ├── orders/index.tsx
    │       ├── users/index.tsx
    │       └── vendors/
    │           ├── index.tsx
    │           └── [id].tsx
    ├── src/
    │   ├── api/
    │   │   ├── axiosInstance.ts    # Axios + token injection + auto-refresh interceptor
    │   │   ├── auth.api.ts
    │   │   ├── cart.api.ts
    │   │   ├── order.api.ts
    │   │   ├── vendor.api.ts
    │   │   └── admin.api.ts
    │   ├── components/
    │   │   ├── common/             # Button, Input, Badge, Loader, EmptyState
    │   │   ├── vendor/             # VendorCard
    │   │   ├── food/               # FoodItemCard
    │   │   ├── order/              # OrderCard, OrderTracker
    │   │   └── cart/
    │   ├── store/
    │   │   ├── authStore.ts        # Zustand: user session, login, logout
    │   │   └── cartStore.ts        # Zustand: cart items, totals
    │   ├── constants/
    │   │   ├── roles.ts
    │   │   └── orderStatus.ts
    │   ├── types/                  # Shared TypeScript interfaces
    │   └── utils/
    │       ├── storage.ts          # AsyncStorage wrappers
    │       └── formatCurrency.ts
    ├── assets/images/
    ├── app.json                    # Expo app config
    ├── tsconfig.json
    ├── .env.example
    └── package.json
```

---

## Prerequisites

Before you begin, make sure the following are installed on your machine:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org) |
| npm | >= 9.x | Bundled with Node.js |
| MySQL | >= 8.x | [mysql.com](https://www.mysql.com/downloads/) |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Expo Go App | Latest | iOS App Store / Google Play Store |

---

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/home-made-foodies.git
cd home-made-foodies/homebite-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

### 4. Set Up the MySQL Database

Log in to MySQL and create the database and user:

```sql
CREATE DATABASE homebite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'homebite_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON homebite_db.* TO 'homebite_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Update `DATABASE_URL` in your `.env`:

```
DATABASE_URL="mysql://homebite_user:your_password@localhost:3306/homebite_db"
```

### 5. Generate Prisma Client and Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. Seed the Database

Populate the database with default categories and test accounts:

```bash
npm run prisma:seed
```

This creates three seed accounts ready for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@homebite.com | Admin@123 |
| Customer | customer@test.com | Customer@123 |
| Vendor | vendor@test.com | Vendor@123 |

> **Note:** Change these credentials immediately in any non-development environment.

### 7. Start the Backend Server

```bash
# Development (with hot reload via nodemon)
npm run dev

# Production
npm start
```

The API will be available at: `http://localhost:5000/api/v1`

To open Prisma Studio (visual database browser):

```bash
npm run prisma:studio
```

---

## Mobile App Setup

### 1. Navigate to the App Directory

```bash
cd ../homebite-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Update the API URL to point to your running backend. If testing on a **physical device**, replace `localhost` with your machine's local IP address — the device cannot reach `localhost` on your computer:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api/v1
EXPO_PUBLIC_APP_NAME=HomeBite
```

> Find your local IP with `ipconfig` (Windows) or `ifconfig` / `ip addr` (Linux/Mac).

### 4. Start the Expo Development Server

```bash
npm start
```

This opens the Expo Metro bundler in your terminal. Then:

- **Physical device** — Scan the QR code with the **Expo Go** app
- **Android emulator** — Press `a` in the terminal
- **iOS simulator** — Press `i` in the terminal

---

## Environment Variables

### Backend — `homebite-backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development                    # development | production

# Database (MySQL)
DATABASE_URL="mysql://homebite_user:your_password@localhost:3306/homebite_db"

# JWT
JWT_ACCESS_SECRET=your_access_token_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_token_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# CORS — comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,exp://localhost:19000

# Razorpay (fill in your dashboard credentials to enable live payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Shiprocket (fill in to enable live delivery)
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password

# File Upload
MAX_FILE_SIZE_MB=5
UPLOAD_DIR=uploads
```

### Mobile App — `homebite-app/.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api/v1
EXPO_PUBLIC_APP_NAME=HomeBite
```

---

## API Endpoints Overview

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive tokens |
| POST | `/auth/refresh-token` | Public | Rotate access token using refresh token |
| GET | `/auth/me` | Private | Get authenticated user |

### Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users/profile` | Customer | Get own profile |
| PUT | `/users/profile` | Customer | Update profile |
| GET | `/users/addresses` | Customer | List saved addresses |
| POST | `/users/addresses` | Customer | Add a new address |
| PUT | `/users/addresses/:id` | Customer | Update an address |
| DELETE | `/users/addresses/:id` | Customer | Delete an address |

### Vendors

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/vendors/register` | Vendor | Submit vendor application |
| GET | `/vendors/profile` | Vendor | Get own vendor profile |
| PUT | `/vendors/profile` | Vendor | Update vendor profile |
| GET | `/vendors/menu` | Vendor | Get own menu items |
| GET | `/vendors` | Public | List all approved vendors |
| GET | `/vendors/:id` | Public | Get vendor details + menu |

### Food Items

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/food-items` | Vendor | Create a food item (with image upload) |
| GET | `/food-items` | Public | List food items |
| GET | `/food-items/:id` | Public | Get food item detail |
| PUT | `/food-items/:id` | Vendor | Update food item |
| DELETE | `/food-items/:id` | Vendor | Delete food item |

### Cart

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/cart` | Customer | Get current cart |
| POST | `/cart/items` | Customer | Add item to cart |
| PUT | `/cart/items/:itemId` | Customer | Update item quantity |
| DELETE | `/cart/items/:itemId` | Customer | Remove item from cart |
| DELETE | `/cart` | Customer | Clear entire cart |

### Orders

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/orders` | Customer | Place a new order |
| GET | `/orders` | Customer / Vendor | List orders |
| GET | `/orders/:id` | Customer / Vendor | Get order detail |
| POST | `/orders/:id/accept` | Vendor | Accept an order |
| POST | `/orders/:id/reject` | Vendor | Reject an order |
| PATCH | `/orders/:id/status` | Vendor | Update order status |
| POST | `/orders/:id/cancel` | Customer | Cancel an order |

### Payments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/payments/razorpay/order` | Customer | Create a Razorpay payment order |
| POST | `/payments/razorpay/verify` | Customer | Verify Razorpay payment signature |
| GET | `/payments/:orderId` | Customer | Get payment record for an order |

### Delivery

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/delivery/:orderId` | Customer / Vendor | Get delivery status and tracking |
| POST | `/delivery/shiprocket/create` | Vendor | Create a Shiprocket shipment |

### Reviews

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/reviews` | Customer | Submit a review (delivered orders only) |
| GET | `/reviews/vendor/:vendorId` | Public | Get reviews for a vendor |
| GET | `/reviews/food/:foodItemId` | Public | Get reviews for a food item |

### Admin

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin/vendors` | Admin | List all vendors |
| PATCH | `/admin/vendors/:id/status` | Admin | Approve / reject / suspend a vendor |
| GET | `/admin/orders` | Admin | List all platform orders |
| GET | `/admin/users` | Admin | List all users |
| GET | `/admin/analytics` | Admin | Platform-level analytics |

---

## Database Schema Overview

The database uses **MySQL** managed through **Prisma ORM**.

### Core Models

| Model | Description |
|-------|-------------|
| `User` | All users with a `role` field: CUSTOMER, VENDOR, or ADMIN |
| `Address` | Delivery addresses belonging to a customer |
| `Vendor` | Vendor business profile, approval status, linked to a User |
| `Category` | Food categories (e.g., Breakfast, Biryani, Snacks) |
| `FoodItem` | A dish listed by a vendor: price, description, dietary tag, availability |
| `Cart` | A customer's active cart; `vendorId` enforces single-vendor restriction |
| `CartItem` | Individual items and quantities inside a Cart |
| `Order` | An order with a full status lifecycle |
| `OrderItem` | Snapshot of each item at order time (name + price denormalized for history) |
| `Payment` | Payment record with Razorpay order ID, payment ID, and verification status |
| `Delivery` | Delivery record with Shiprocket shipment ID, AWB, and tracking status |
| `Review` | Customer ratings and comments for vendors and food items |
| `OtpToken` | Tokens for email/phone OTP verification |

### Relationships

```
User ──┬── Vendor ──── FoodItem ──┬── CartItem ── Cart
       │                          │
       │         Order ───────────┴── OrderItem
       │           ├── Payment
       │           └── Delivery
       ├── Review
       └── Address
```

### Key Enums

```
Role              → CUSTOMER | VENDOR | ADMIN
VendorStatus      → PENDING | APPROVED | REJECTED | SUSPENDED
OrderStatus       → PENDING_PAYMENT | PAYMENT_FAILED | CONFIRMED | ACCEPTED
                    | PREPARING | READY_FOR_PICKUP | OUT_FOR_DELIVERY
                    | DELIVERED | CANCELLED
PaymentStatus     → PENDING | SUCCESS | FAILED | REFUNDED
DeliveryStatus    → NOT_INITIATED | PICKUP_SCHEDULED | PICKED_UP
                    | IN_TRANSIT | DELIVERED | FAILED
DietaryTag        → VEG | NON_VEG | VEGAN | JAIN | GLUTEN_FREE
```

---

## Order Flow

```
Customer adds items to cart
(single-vendor per cart enforced at cart level)
         │
         ▼
Customer proceeds to checkout
→ Selects delivery address
         │
         ▼
POST /orders
→ Order created with status: PENDING_PAYMENT
→ Cart is cleared
         │
         ▼
POST /payments/razorpay/order
→ Razorpay payment order created
         │
         ▼
Customer completes payment in Razorpay checkout UI
         │
         ▼
POST /payments/razorpay/verify
→ HMAC signature verified server-side
→ Order status updated to: CONFIRMED
         │
         ▼
Vendor sees new order in dashboard
         │
         ▼
Vendor accepts order → Status: ACCEPTED
         │
         ▼
Vendor starts cooking  → Status: PREPARING
         │
         ▼
Vendor marks ready     → Status: READY_FOR_PICKUP
         │
         ▼
POST /delivery/shiprocket/create
→ Shiprocket shipment created
→ AWB number recorded
         │
         ▼
Delivery agent picks up → Status: OUT_FOR_DELIVERY
         │
         ▼
Delivered to customer   → Status: DELIVERED
         │
         ▼
Customer submits review → POST /reviews
```

> **Cancellations:** A customer can cancel before the order is ACCEPTED by the vendor. Payment refunds on cancellation are planned via Razorpay's refund API.

---

## Future Improvements

- [ ] **Push Notifications** — Real-time order status alerts via Expo Push Notifications or Firebase FCM
- [ ] **Cloud Image Storage** — Migrate food item images from local `uploads/` to AWS S3 or Cloudinary
- [ ] **Automated Refunds** — Trigger Razorpay refunds automatically on order cancellation
- [ ] **OTP Verification** — Complete email/phone OTP flow using the existing `OtpToken` model
- [ ] **Geolocation Filtering** — Filter vendors by proximity to customer location (Haversine formula or PostGIS)
- [ ] **Real-time Order Tracking** — WebSocket or Server-Sent Events for live status updates without polling
- [ ] **Discount & Coupon System** — Promo codes and vendor-specific discount campaigns
- [ ] **Web Admin Dashboard** — Dedicated React web dashboard for platform administration
- [ ] **Deep Analytics** — Vendor earnings reports, peak order hours, and platform revenue metrics
- [ ] **Multi-language Support** — i18n for regional language support across the mobile app
- [ ] **Dark Mode** — Theme toggle support in the mobile app

---

## Deployment Plan

### Containerization with Docker

**`homebite-backend/Dockerfile`**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "src/server.js"]
```

**`docker-compose.yml`** (project root)

```yaml
version: "3.9"
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: homebite_db
      MYSQL_USER: homebite_user
      MYSQL_PASSWORD: your_password
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./homebite-backend
    ports:
      - "5000:5000"
    env_file:
      - ./homebite-backend/.env
    depends_on:
      - db
    volumes:
      - uploads_data:/app/uploads

volumes:
  db_data:
  uploads_data:
```

```bash
# Start all services
docker-compose up --build

# Run migrations inside the container
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend node prisma/seed.js
```

### Cloud Hosting

| Component | Recommended Service |
|-----------|-------------------|
| Backend API | Railway, Render, or AWS EC2 |
| MySQL Database | PlanetScale, AWS RDS, or Railway MySQL |
| File Storage | AWS S3 + CloudFront CDN |
| Mobile App | Expo EAS Build (Android APK / iOS IPA) |
| Domain & SSL | Cloudflare (free SSL + CDN proxy) |

### Mobile App Build & Distribution

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build for Android (APK for internal testing)
eas build --platform android --profile preview

# Build for production (both platforms)
eas build --platform all --profile production

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

---

## Contributing

Contributions are welcome. Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with a descriptive message:
   ```bash
   git commit -m "feat: add vendor payout dashboard"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request against the `main` branch

### Code Style Guidelines

- Follow the existing module structure: `service → controller → routes`
- Keep controllers thin — business logic belongs in services
- Use the `asyncHandler` wrapper for all async route controllers
- Return consistent responses through the `apiResponse` utility
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)

### Reporting Bugs

Open an issue and include:
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots or server logs (if applicable)

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 HomeBite

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

<div align="center">
  <p>Built with care for home cooks everywhere.</p>
  <p><strong>HomeBite</strong> — Real food. Real people.</p>
</div>

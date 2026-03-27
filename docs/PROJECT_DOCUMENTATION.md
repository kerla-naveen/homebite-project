# HomeBite – Home-Made Food Marketplace Platform
## Software Project Documentation

---

| Field | Details |
|---|---|
| Project Title | HomeBite – Home-Made Food Marketplace Platform |
| Technology Stack | Node.js, Express.js, MySQL, Prisma ORM, React Native (Expo) |
| Document Version | 1.0 |
| Date | March 2026 |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Stakeholders](#4-stakeholders)
5. [System Architecture](#5-system-architecture)
6. [Architecture Diagram](#6-architecture-diagram)
7. [Technology Stack](#7-technology-stack)
8. [Functional Requirements](#8-functional-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Database Design](#10-database-design)
11. [API Design](#11-api-design)
12. [Order Processing Flow](#12-order-processing-flow)
13. [Security Design](#13-security-design)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Future Enhancements](#15-future-enhancements)
16. [Conclusion](#16-conclusion)

---

## 1. Introduction

### 1.1 Project Overview

HomeBite is a full-stack mobile marketplace platform that enables home cooks (referred to as **vendors**) to sell their home-prepared food directly to customers in their locality. The platform operates as a two-sided marketplace — home cooks register as vendors, list their dishes with pricing and dietary information, and manage incoming orders — while customers browse vendor menus, place orders, make payments, and track deliveries through a mobile app.

The system is composed of two independently deployable components: a RESTful backend API built with Node.js and Express.js, backed by a MySQL database managed through Prisma ORM, and a cross-platform mobile application built with React Native using the Expo framework.

### 1.2 Purpose of the System

The core purpose of HomeBite is to create a trusted, structured channel through which home-cooked food can be discovered, ordered, paid for, and delivered — capabilities that previously required informal, word-of-mouth arrangements. The system:

- Provides home cooks with a digital storefront to list, manage, and sell food items.
- Provides customers with a curated, browsable catalog of home-made food vendors in their area.
- Provides a platform administrator with tools to approve vendors, manage users, and monitor platform activity.
- Integrates with established payment (Razorpay) and logistics (Shiprocket) infrastructure so vendors do not need to manage these independently.

### 1.3 Scope of the Project

The scope of this project covers:

- **User management** — Registration, login, and profile management for three roles: Customer, Vendor, and Admin. Secure authentication using JSON Web Tokens (JWT) with access and refresh token rotation.
- **Vendor management** — A complete vendor onboarding and admin approval workflow. Vendors can manage their business profile, food menu, and order acceptance.
- **Food catalog** — Creation and management of food items with categories, images, pricing, and dietary tags.
- **Cart and ordering** — A persistent cart with single-vendor enforcement, order placement with price snapshotting, and a full order status lifecycle.
- **Payment processing** — Integration with Razorpay for payment order creation and server-side payment signature verification.
- **Delivery integration** — Integration with Shiprocket for shipment creation and delivery tracking.
- **Review system** — Customer reviews and ratings for vendors and food items after delivery.
- **Admin panel** — Vendor approval/rejection, user management, and platform analytics.

The following are **outside the scope** of this version: a web-based storefront, direct chat between customers and vendors, subscription or loyalty programs, and automated payouts to vendors.

---

## 2. Problem Statement

### 2.1 Background

The food delivery industry has grown dramatically in the past decade, driven by platforms like Zomato and Swiggy. However, these platforms are almost exclusively designed for registered restaurants — commercial food businesses with formal licenses, large kitchens, and established supply chains. They offer no accessible pathway for talented home cooks who prepare food with quality ingredients and personal recipes.

At the same time, a large segment of the population — particularly students, working professionals, and people living away from home — actively seeks the kind of wholesome, affordable, home-style food that restaurants do not provide. This segment currently relies on informal networks (social media groups, word of mouth, known contacts) to find home cooks, which is neither scalable, discoverable, nor reliable.

### 2.2 The Core Problems

**For Home Cooks (Vendors):**
- No structured digital platform to advertise their food and reach customers beyond their immediate circle.
- No system to manage incoming orders, update preparation status, or communicate delivery information.
- Dependence on cash payments and personal phone numbers for transactions.
- No mechanism for customers to review and verify the quality of their food.

**For Customers:**
- No reliable way to discover home-cooked food options nearby.
- No visibility into vendor approval status, dietary information, or customer reviews.
- No standardized ordering, payment, or delivery tracking experience.
- No recourse mechanism if an order goes wrong.

**For the Ecosystem:**
- Home-cooked food businesses operate in an unorganized, undiscoverable grey zone.
- Talented home cooks cannot scale beyond a small, fixed customer base.
- Customers cannot compare, review, or make informed choices.

### 2.3 The Gap HomeBite Fills

HomeBite addresses all of these gaps by providing a structured, mobile-first marketplace where:
1. Home cooks go through a verified onboarding process before selling.
2. Customers can discover, browse, and order from approved vendors with full dietary and pricing transparency.
3. Payments are handled securely through an integrated gateway.
4. Deliveries are tracked end-to-end through an integrated logistics provider.
5. The entire interaction is governed by a platform administrator ensuring quality and policy compliance.

---

## 3. Objectives

### 3.1 Primary Objectives

1. **Build a discoverable marketplace** — Enable customers to browse and filter a catalog of approved home cooks based on location, food category, and dietary preference.

2. **Empower home cooks** — Provide vendors with a complete digital toolkit: menu management, order acceptance, preparation status updates, and delivery initiation.

3. **Ensure platform trust and safety** — Implement a mandatory vendor approval workflow so only verified home cooks appear on the platform. Support FSSAI license capture and admin oversight.

4. **Deliver a seamless order experience** — From cart to payment to delivery tracking, the customer journey must be fully managed within the application without external redirects or manual coordination.

5. **Enforce financial accuracy** — Snapshot order item names and prices at placement time so that changes to menu pricing do not retroactively alter historical order records.

6. **Implement production-grade security** — Use stateless JWT authentication with token rotation, role-based access control on every API endpoint, input validation, rate limiting, and secure password hashing.

### 3.2 Secondary Objectives

- Design the system so that Razorpay and Shiprocket integrations can be activated without changing the surrounding application code (stubbed to live API signature parity).
- Support multiple delivery addresses per customer.
- Implement a review and rating system gated to customers who have completed delivery.
- Provide an admin analytics dashboard for platform-level monitoring.

---

## 4. Stakeholders

### 4.1 Customer

The **Customer** is the primary consumer of the platform. Customers are individuals who want to purchase home-cooked food. Their interaction spans the entire product journey: discovery, ordering, payment, tracking, and review.

**Goals:**
- Browse nearby vendors and their menus with dietary filters.
- Add items to a cart and complete checkout using an integrated payment gateway.
- Track the status of active orders from confirmation to delivery.
- Manage multiple saved delivery addresses.
- Leave a rating and review after a delivered order.

**Pain Points Addressed:**
- Removes the need to search informally for home cooks.
- Provides dietary transparency (Veg, Non-Veg, Vegan, Jain, Gluten-Free tags).
- Eliminates cash-only, untracked transactions.

### 4.2 Vendor (Home Cook)

The **Vendor** is a home cook who registers on the platform to sell food. Vendors go through an admin approval process before their listings become publicly visible. They are the supply side of the marketplace.

**Goals:**
- Register a business profile with their kitchen location, FSSAI number, and bank/UPI details.
- Create and manage a menu of food items with images, descriptions, pricing, and dietary tags.
- Accept or reject incoming orders within a defined window.
- Update order preparation status in real time.
- Initiate delivery through Shiprocket once food is ready.

**Pain Points Addressed:**
- Provides a professional digital storefront without requiring technical knowledge.
- Removes dependency on personal contacts for order management.
- Structures the payment and delivery process.

### 4.3 Admin

The **Admin** is the platform operator. There is typically one or a small team of admins who oversee platform integrity, vendor quality, and compliance.

**Goals:**
- Review vendor applications and approve, reject, or suspend vendors.
- Monitor all users and orders across the platform.
- Access analytics: total orders, revenue, registered users, vendor count.
- Intervene in disputed or problematic orders.

**Responsibilities:**
- Ensuring only legitimate, safe home cooks are approved.
- Blocking users who violate platform terms.
- Platform health monitoring.

### 4.4 Delivery Partner

The **Delivery Partner** is an indirect stakeholder. HomeBite integrates with **Shiprocket**, which in turn assigns third-party courier partners to fulfill deliveries. The delivery partner does not directly interact with the HomeBite application — they interact with the Shiprocket ecosystem. From HomeBite's perspective, the delivery partner is represented by an AWB (Air Waybill) code, courier name, and tracking URL stored in the `Delivery` record.

**Interaction with System:**
- Receives pickup instructions from Shiprocket.
- Picks up food from vendor location.
- Delivers to customer's address.
- Updates delivery status (reflected back via Shiprocket tracking).

---

## 5. System Architecture

HomeBite follows a **three-tier client-server architecture** with a clear separation between presentation, application logic, and data storage layers.

### 5.1 Presentation Layer — React Native Mobile Application

The mobile application is built with React Native using the Expo SDK and Expo Router for file-based navigation. It serves all three user roles (Customer, Vendor, Admin) in a single application, with role-based navigation stacks that activate after authentication.

The app communicates with the backend exclusively through HTTPS REST API calls using an Axios HTTP client. All application state is managed through Zustand stores. Tokens are handled as follows: the access token lives only in memory (Zustand store), while the refresh token is persisted to device secure storage using `expo-secure-store`. On every app launch, the root layout attempts to restore a session by using the stored refresh token before redirecting users to their role-appropriate screen.

### 5.2 Application Layer — Node.js + Express.js REST API

The backend is a stateless REST API organized into feature modules. Each module encapsulates its own routes, controller, and service. The architecture enforces the following separation:

- **Routes** declare endpoints and apply middleware chains (authentication, role guards, request validation).
- **Controllers** are thin — they call the appropriate service function and return the result using a standardized response helper. They contain no business logic.
- **Services** contain all business logic and direct database interactions via Prisma.

The API is protected by several middleware layers: Helmet for HTTP header security, CORS for cross-origin restriction, rate limiting (200 requests per 15 minutes per IP), JWT-based authentication, and role-based access control. All incoming request bodies are validated using Joi schemas before reaching controllers.

### 5.3 Data Layer — MySQL + Prisma ORM

The database is MySQL 8.0. All database access is performed through Prisma ORM, which provides type-safe query building, automatic migration management, and a generated client. The Prisma schema is the single source of truth for all table definitions, enums, and relationships. Migrations are tracked and versioned, ensuring schema changes are reproducible across environments.

### 5.4 External Services

| Service | Purpose | Integration Status |
|---|---|---|
| Razorpay | Payment order creation and HMAC signature verification | Stubbed (live-API-compatible) |
| Shiprocket | Shipment creation, AWB assignment, delivery tracking | Stubbed (live-API-compatible) |
| Multer (local) | Food item image upload and static file serving | Active |

The payment and delivery service stubs implement the same function signatures as the live API calls, meaning activation requires only credential configuration and removal of stub flags — no structural code changes.

---

## 6. Architecture Diagram

### 6.1 High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                                  │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │           React Native Mobile App (Expo SDK 51)          │   │
│   │                                                          │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│   │  │  (customer) │  │  (vendor)   │  │    (admin)      │  │   │
│   │  │   Screens   │  │   Screens   │  │    Screens      │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│   │                                                          │   │
│   │  ┌────────────────────────────────────────────────────┐  │   │
│   │  │  Zustand Stores: authStore | cartStore             │  │   │
│   │  └────────────────────────────────────────────────────┘  │   │
│   │  ┌────────────────────────────────────────────────────┐  │   │
│   │  │  Axios Instance  (JWT inject + 401 auto-refresh)   │  │   │
│   │  └────────────────────────────────────────────────────┘  │   │
│   └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS / REST API  /api/v1
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                   APPLICATION LAYER                              │
│                                                                  │
│             Node.js + Express.js REST API (:5000)                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │    Security Middleware Stack                             │    │
│  │    Helmet | CORS | Rate Limiter | Morgan Logger          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │   Auth   │  │  Vendor  │  │  Orders  │  │    Admin     │    │
│  │  Module  │  │  Module  │  │  Module  │  │   Module     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │   Cart   │  │   Food   │  │ Payments │  │   Delivery   │    │
│  │  Module  │  │  Items   │  │  Module  │  │   Module     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │    Route Middleware: auth | roleGuard | validate         │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────┬────────────────────────┬────────────────────────────┘
             │                        │
    ┌────────▼──────────┐    ┌────────▼───────────────────────┐
    │    DATA LAYER     │    │       EXTERNAL SERVICES        │
    │                   │    │                                │
    │  MySQL 8.0        │    │  ┌──────────────────────────┐  │
    │  Prisma ORM       │    │  │  Razorpay Payment Gateway│  │
    │                   │    │  │  (Payment processing)    │  │
    │  users            │    │  └──────────────────────────┘  │
    │  vendors          │    │  ┌──────────────────────────┐  │
    │  food_items       │    │  │  Shiprocket Logistics    │  │
    │  categories       │    │  │  (Delivery & tracking)   │  │
    │  carts            │    │  └──────────────────────────┘  │
    │  cart_items       │    │  ┌──────────────────────────┐  │
    │  orders           │    │  │  Multer File Storage     │  │
    │  order_items      │    │  │  (Food item images)      │  │
    │  payments         │    │  └──────────────────────────┘  │
    │  deliveries       │    └────────────────────────────────┘
    │  reviews          │
    │  addresses        │
    │  otp_tokens       │
    └───────────────────┘
```

### 6.2 Module Interaction Diagram

```
                       HTTP Request
                           │
                    ┌──────▼──────┐
                    │   Router    │  ← declares endpoints
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │  Middleware Chain       │
              │  auth → roleGuard       │
              │  → validate(joiSchema)  │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │ Controller  │  ← thin, no logic
                    └──────┬──────┘
                           │  calls
                    ┌──────▼──────┐
                    │   Service   │  ← all business logic
                    └──────┬──────┘
                           │  queries
                    ┌──────▼──────┐
                    │   Prisma    │  ← ORM client
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   MySQL DB  │
                    └─────────────┘
```

---

## 7. Technology Stack

### 7.1 Backend

#### Node.js
Node.js was chosen as the server-side runtime for its non-blocking, event-driven I/O model, which is well-suited to a marketplace API that handles many concurrent, short-duration requests (browsing menus, cart updates, order status checks). Its vast npm ecosystem provides mature, battle-tested packages for every requirement in this project.

#### Express.js
Express.js is the de facto minimal web framework for Node.js. It was selected for its simplicity, flexibility, and middleware model, which maps cleanly onto the layered architecture (authentication middleware, role guard, validation, error handling) used in this project. Express imposes no structural opinions, allowing the modular `routes/controller/service` pattern to be enforced by convention rather than framework constraint.

#### Prisma ORM
Prisma was selected over raw SQL and alternatives (Sequelize, TypeORM) for three key reasons:
1. **Schema-first approach** — `schema.prisma` is the single source of truth. Migrations are auto-generated and versioned, making schema evolution predictable.
2. **Type safety** — The generated Prisma client provides full auto-complete and type checking, eliminating a class of runtime errors common with string-based query builders.
3. **Prisma Studio** — A built-in visual database browser accelerates development and debugging without requiring a separate GUI tool.

#### MySQL
MySQL 8.0 was chosen for its reliability, widespread industry adoption, and strong support for relational integrity — critical in a marketplace where foreign-key relationships between users, vendors, orders, and payments must remain consistent. The `utf8mb4` character set supports full Unicode, including emoji in food descriptions.

#### Supporting Backend Libraries

| Library | Version | Purpose |
|---|---|---|
| `jsonwebtoken` | 9.0.2 | JWT signing and verification |
| `bcryptjs` | 2.4.3 | Secure password hashing (bcrypt, 10 rounds) |
| `joi` | 17.13.1 | Declarative request body validation schemas |
| `helmet` | 7.1.0 | Sets security-relevant HTTP headers |
| `cors` | 2.8.5 | Cross-origin resource sharing policy |
| `express-rate-limit` | 7.3.1 | IP-based rate limiting (200 req / 15 min) |
| `multer` | 1.4.5-lts.1 | Multipart file upload handling |
| `razorpay` | 2.9.2 | Razorpay Node SDK |
| `morgan` | 1.10.0 | HTTP request logging |
| `compression` | 1.7.4 | Gzip response compression |
| `uuid` | 9.0.1 | Unique ID generation |
| `nodemon` | 3.1.4 | Development hot-reload |

### 7.2 Mobile Application

#### React Native
React Native enables a single JavaScript/TypeScript codebase to produce native mobile applications for both Android and iOS. This was a pragmatic choice: building separate native apps for two platforms would double the development effort while providing no meaningful advantage for a marketplace MVP.

#### Expo SDK 51
Expo significantly reduces the setup and tooling overhead of React Native development. It provides a managed workflow for building, testing (via Expo Go), and distributing the application. Specific Expo packages used include:
- `expo-secure-store` for encrypted token storage on device
- `expo-image-picker` for food item image selection by vendors
- `expo-router` for file-based navigation

#### Expo Router (v3.5)
Expo Router brings file-system-based routing (similar to Next.js) to React Native. Each file in the `app/` directory corresponds to a route. This was chosen for its built-in support for route groups (enabling the `(customer)`, `(vendor)`, and `(admin)` stacks to coexist in one app) and deep linking support.

#### Zustand
Zustand was selected over Redux for state management due to its minimal boilerplate and simple API. Two stores are maintained: `authStore` (user session, access token, authentication state) and `cartStore` (cart items, totals, mutation actions). Zustand's ability to access store state outside of React components is particularly useful for the Axios interceptor, which reads the access token from `authStore.getState()` without subscribing to the React tree.

#### Supporting Mobile Libraries

| Library | Version | Purpose |
|---|---|---|
| `axios` | 1.7.2 | HTTP client with interceptors |
| `react-hook-form` | 7.52.1 | Performant form state management |
| `zod` | 3.23.8 | TypeScript-first schema validation |
| `@hookform/resolvers` | 3.6.0 | Connects Zod to React Hook Form |
| `react-native-reanimated` | 3.10.1 | Smooth UI animations |
| `react-native-toast-message` | 2.2.0 | User feedback toasts |
| `@expo/vector-icons` | 14.0.3 | Icon library |

---

## 8. Functional Requirements

### 8.1 User Registration and Authentication

| ID | Requirement |
|---|---|
| FR-01 | A user shall be able to register with name, email, phone number, password, and role (CUSTOMER or VENDOR). |
| FR-02 | The system shall prevent duplicate registrations using the same email address. |
| FR-03 | Passwords shall be hashed using bcrypt before storage. The plaintext password shall never be stored or logged. |
| FR-04 | On successful login, the system shall issue a JWT access token (15-minute expiry) and a JWT refresh token (7-day expiry). |
| FR-05 | The access token shall be used to authenticate all subsequent API requests via the `Authorization: Bearer <token>` header. |
| FR-06 | When the access token expires, the client shall present the refresh token to the `/auth/refresh-token` endpoint to obtain a new access/refresh token pair. The old refresh token shall be invalidated immediately (rotation). |
| FR-07 | If a refresh token is presented that does not match the stored value for that user, the system shall treat it as token reuse and reject it. |
| FR-08 | A user shall be able to change their password by providing their current and new passwords. |
| FR-09 | An admin shall be able to block a user account, preventing login. |

### 8.2 Vendor Onboarding

| ID | Requirement |
|---|---|
| FR-10 | A user with role VENDOR shall be able to submit a vendor application containing: business name, description, FSSAI number, city, state, pincode, logo, and bank/UPI details. |
| FR-11 | On submission, the vendor record shall be created with status `PENDING`. The vendor shall not appear in public listings until approved. |
| FR-12 | An admin shall be able to approve, reject, or suspend a vendor. A rejection must include a rejection reason. |
| FR-13 | An approved vendor shall be able to toggle their `isAcceptingOrders` flag to temporarily stop receiving new orders. |
| FR-14 | A vendor profile shall store geolocation coordinates (latitude, longitude) to support future proximity-based filtering. |

### 8.3 Food Listing

| ID | Requirement |
|---|---|
| FR-15 | An approved vendor shall be able to create food items with: name, description, category, price, discounted price, preparation time, serving size, dietary tag, and an image. |
| FR-16 | Dietary tags shall be one of: VEG, NON_VEG, VEGAN, JAIN, GLUTEN_FREE. |
| FR-17 | A vendor shall be able to toggle individual food item availability without deleting the item. |
| FR-18 | Food item deletion shall be a soft delete (`isDeleted = true`). The item shall not appear in public listings but historical order references shall remain intact. |
| FR-19 | Customers shall be able to browse food items filtered by category, dietary tag, or vendor. |

### 8.4 Cart and Order Management

| ID | Requirement |
|---|---|
| FR-20 | A customer shall have exactly one active cart at any time. |
| FR-21 | A cart shall be restricted to items from a single vendor. Attempting to add an item from a different vendor shall be rejected with an appropriate error. |
| FR-22 | A customer shall be able to add, update quantity, and remove individual items from the cart. |
| FR-23 | When placing an order, the system shall snapshot the `name` and `price` of each `OrderItem` at the time of placement. Future changes to food item pricing shall not affect historical orders. |
| FR-24 | On order placement, the cart shall be cleared. |
| FR-25 | Order status shall progress through a defined state machine: `PENDING_PAYMENT → CONFIRMED → ACCEPTED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED`. |
| FR-26 | A customer shall be able to cancel an order only if its status is `PENDING_PAYMENT` or `CONFIRMED`. |
| FR-27 | A vendor shall be able to accept or reject a `CONFIRMED` order. A rejection reason shall be captured. |
| FR-28 | A vendor shall be able to update order status from `ACCEPTED` through `READY_FOR_PICKUP`. |

### 8.5 Payment System

| ID | Requirement |
|---|---|
| FR-29 | Before placing an order, the customer shall initiate payment through Razorpay. |
| FR-30 | The backend shall create a Razorpay order object and return the `razorpayOrderId` to the client. |
| FR-31 | After the customer completes payment in the Razorpay checkout, the client shall submit the `razorpayPaymentId`, `razorpayOrderId`, and `razorpaySignature` to the backend for verification. |
| FR-32 | The backend shall verify the Razorpay HMAC signature server-side using the `RAZORPAY_KEY_SECRET`. Only a verified payment shall update the order status to `CONFIRMED`. |
| FR-33 | A failed payment shall set the order status to `PAYMENT_FAILED`. |

### 8.6 Delivery Integration

| ID | Requirement |
|---|---|
| FR-34 | Once an order reaches `READY_FOR_PICKUP` status, the vendor shall be able to create a Shiprocket shipment. |
| FR-35 | The system shall store the Shiprocket order ID, shipment ID, AWB code, courier name, and tracking URL in the `Delivery` record. |
| FR-36 | Customers shall be able to retrieve delivery status and tracking URL for their active orders. |
| FR-37 | Delivery status shall reflect the Shiprocket status: `NOT_INITIATED → PICKUP_SCHEDULED → PICKED_UP → IN_TRANSIT → DELIVERED`. |

### 8.7 Reviews and Ratings

| ID | Requirement |
|---|---|
| FR-38 | A customer shall only be able to submit a review for a food item from an order with status `DELIVERED`. |
| FR-39 | Each customer shall be restricted to one review per food item (enforced by a unique constraint on `[customerId, foodItemId]`). |
| FR-40 | Reviews shall include a numeric rating and an optional comment. |
| FR-41 | Vendor and food item review listings shall be publicly accessible without authentication. |

---

## 9. Non-Functional Requirements

### 9.1 Scalability

- **Horizontal scaling**: The backend is stateless — no session state is stored in process memory. Access tokens are verified by signature, and refresh tokens are validated against the database. This design allows multiple backend instances to run behind a load balancer without session affinity requirements.
- **Database connection pooling**: Prisma manages a connection pool to MySQL, preventing connection exhaustion under concurrent load.
- **Pagination**: All list endpoints support pagination to prevent unbounded data fetches as the dataset grows.

### 9.2 Security

- **Password security**: Passwords are hashed with bcrypt using 10 salt rounds. The hash is never returned in any API response.
- **JWT expiry**: Access tokens expire in 15 minutes, minimizing the window of exposure if a token is intercepted.
- **Refresh token rotation**: Every token refresh issues a new refresh token and invalidates the old one. Reuse of an old refresh token is detected and rejected.
- **Rate limiting**: The API enforces a limit of 200 requests per IP per 15-minute window via `express-rate-limit`, mitigating brute-force and enumeration attacks.
- **HTTP security headers**: Helmet sets production-appropriate HTTP headers (Content-Security-Policy, X-Frame-Options, X-XSS-Protection, etc.).
- **Input validation**: All incoming request bodies are validated against strict Joi schemas. Unknown fields are stripped before processing.
- **CORS policy**: The API only accepts requests from origins explicitly listed in `ALLOWED_ORIGINS`. All other origins are rejected.
- **Role-based access**: Every protected endpoint enforces a role guard. A customer cannot access vendor endpoints and vice versa.

### 9.3 Performance

- **Response compression**: Gzip compression is applied to all API responses via the `compression` middleware, reducing payload size.
- **Selective field queries**: Prisma queries use `select` and `include` to retrieve only the fields needed for each response, avoiding over-fetching.
- **Client-side caching**: The mobile app stores vendor and menu data in component state to avoid redundant API calls during a session.
- **Image uploads**: Food item images are served as static files from the `uploads/` directory using Express's static file middleware, offloading delivery from the application logic.

### 9.4 Reliability

- **Graceful shutdown**: The server handles `SIGTERM` and `SIGINT` signals to close the database connection cleanly before exiting, preventing data corruption.
- **Global error handler**: An Express error-handling middleware catches all unhandled errors and returns a structured JSON error response, preventing raw stack traces from leaking to clients.
- **Async error propagation**: All async controller functions are wrapped with `asyncHandler`, ensuring that promise rejections are forwarded to the global error handler rather than causing unhandled rejection crashes.
- **Environment-based logging**: Morgan HTTP logging is active in development and production (combined format) but disabled in the test environment.

---

## 10. Database Design

### 10.1 Database Overview

The database is **MySQL 8.0** managed through **Prisma ORM**. All tables use `cuid()` as the primary key type — a collision-resistant, URL-safe unique identifier suitable for distributed systems. All monetary values are stored as `DECIMAL(10, 2)` to avoid floating-point precision errors.

### 10.2 Table Definitions

#### `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | Unique user identifier |
| name | VARCHAR | NOT NULL | Full name |
| email | VARCHAR | UNIQUE, NOT NULL | Login identifier |
| phone | VARCHAR | UNIQUE, NULLABLE | Optional phone number |
| passwordHash | TEXT | NOT NULL | bcrypt hash |
| role | ENUM | NOT NULL, DEFAULT CUSTOMER | CUSTOMER / VENDOR / ADMIN |
| avatarUrl | TEXT | NULLABLE | Profile picture URL |
| isEmailVerified | BOOLEAN | DEFAULT false | Email verification flag |
| isBlocked | BOOLEAN | DEFAULT false | Admin block flag |
| refreshToken | TEXT | NULLABLE | Current refresh token (rotated on use) |
| createdAt | DATETIME | DEFAULT now() | Creation timestamp |
| updatedAt | DATETIME | AUTO | Last update timestamp |

#### `addresses`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| userId | VARCHAR | FK → users.id (CASCADE) | Owner |
| label | VARCHAR | NOT NULL | e.g., "Home", "Office" |
| line1 | VARCHAR | NOT NULL | Street address |
| line2 | VARCHAR | NULLABLE | Apartment/flat |
| city | VARCHAR | NOT NULL | |
| state | VARCHAR | NOT NULL | |
| pincode | VARCHAR | NOT NULL | |
| lat | FLOAT | NULLABLE | Latitude for geolocation |
| lng | FLOAT | NULLABLE | Longitude for geolocation |
| isDefault | BOOLEAN | DEFAULT false | Default address flag |

#### `vendors`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| userId | VARCHAR | FK → users.id, UNIQUE | One vendor profile per user |
| businessName | VARCHAR | NOT NULL | Kitchen/brand name |
| description | TEXT | NULLABLE | About the kitchen |
| fssaiNumber | VARCHAR | UNIQUE, NULLABLE | Food safety licence number |
| logoUrl / bannerUrl | TEXT | NULLABLE | Brand images |
| city / state / pincode | VARCHAR | NOT NULL | Location |
| lat / lng | FLOAT | NULLABLE | Coordinates |
| status | ENUM | DEFAULT PENDING | PENDING/APPROVED/REJECTED/SUSPENDED |
| rejectionReason | TEXT | NULLABLE | Set on rejection |
| isAcceptingOrders | BOOLEAN | DEFAULT false | Toggle open/closed |
| bankAccountNumber / bankIfsc / bankAccountName | VARCHAR | NULLABLE | Payout details |
| upiId | VARCHAR | NULLABLE | UPI payout |
| shiprocketId | VARCHAR | NULLABLE | Shiprocket account linkage |

#### `categories`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| name | VARCHAR | UNIQUE | Display name |
| slug | VARCHAR | UNIQUE | URL-safe identifier |
| imageUrl | TEXT | NULLABLE | |
| isActive | BOOLEAN | DEFAULT true | |
| sortOrder | INT | DEFAULT 0 | Display ordering |

#### `food_items`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| vendorId | VARCHAR | FK → vendors.id (CASCADE) | |
| categoryId | VARCHAR | FK → categories.id | |
| name | VARCHAR | NOT NULL | |
| description | TEXT | NULLABLE | |
| imageUrl | TEXT | NULLABLE | |
| price | DECIMAL(10,2) | NOT NULL | Base price |
| discountedPrice | DECIMAL(10,2) | NULLABLE | Sale price |
| preparationTime | INT | NULLABLE | Minutes |
| servingSize | VARCHAR | NULLABLE | e.g., "2 persons" |
| dietaryTag | ENUM | DEFAULT VEG | VEG/NON_VEG/VEGAN/JAIN/GLUTEN_FREE |
| isAvailable | BOOLEAN | DEFAULT true | Toggle availability |
| isDeleted | BOOLEAN | DEFAULT false | Soft delete flag |
| sortOrder | INT | DEFAULT 0 | Menu ordering |

#### `carts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| userId | VARCHAR | FK → users.id, UNIQUE | One cart per user |
| vendorId | VARCHAR | NULLABLE | Enforces single-vendor constraint |

#### `cart_items`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| cartId | VARCHAR | FK → carts.id (CASCADE) | |
| foodItemId | VARCHAR | FK → food_items.id | |
| quantity | INT | DEFAULT 1 | |
| — | — | UNIQUE(cartId, foodItemId) | No duplicate items |

#### `orders`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| customerId | VARCHAR | FK → users.id | |
| vendorId | VARCHAR | FK → vendors.id | |
| addressId | VARCHAR | FK → addresses.id | Delivery address snapshot |
| status | ENUM | DEFAULT PENDING_PAYMENT | Order lifecycle state |
| subtotal | DECIMAL(10,2) | NOT NULL | Items total |
| deliveryFee | DECIMAL(10,2) | DEFAULT 0 | |
| discount | DECIMAL(10,2) | DEFAULT 0 | |
| total | DECIMAL(10,2) | NOT NULL | Final amount charged |
| notes | TEXT | NULLABLE | Customer instructions |
| cancelReason | TEXT | NULLABLE | Populated on cancellation |

#### `order_items`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| orderId | VARCHAR | FK → orders.id (CASCADE) | |
| foodItemId | VARCHAR | FK → food_items.id | Reference back to menu item |
| name | VARCHAR | NOT NULL | **Snapshot** of name at order time |
| price | DECIMAL(10,2) | NOT NULL | **Snapshot** of price at order time |
| quantity | INT | NOT NULL | |
| total | DECIMAL(10,2) | NOT NULL | price × quantity |

#### `payments`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| orderId | VARCHAR | FK → orders.id, UNIQUE | One payment per order |
| razorpayOrderId | VARCHAR | UNIQUE, NULLABLE | Razorpay's order identifier |
| razorpayPaymentId | VARCHAR | UNIQUE, NULLABLE | Razorpay's payment identifier |
| razorpaySignature | TEXT | NULLABLE | HMAC signature for verification |
| amount | DECIMAL(10,2) | NOT NULL | Charged amount |
| currency | VARCHAR | DEFAULT "INR" | |
| status | ENUM | DEFAULT PENDING | PENDING/SUCCESS/FAILED/REFUNDED |
| failureReason | TEXT | NULLABLE | |
| refundId | VARCHAR | NULLABLE | Razorpay refund ID |

#### `deliveries`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| orderId | VARCHAR | FK → orders.id, UNIQUE | One delivery per order |
| shiprocketOrderId | VARCHAR | NULLABLE | Shiprocket order reference |
| shiprocketShipmentId | VARCHAR | NULLABLE | Shiprocket shipment reference |
| awbCode | VARCHAR | NULLABLE | Air Waybill number |
| courierName | VARCHAR | NULLABLE | Assigned courier partner |
| trackingUrl | TEXT | NULLABLE | Live tracking link |
| status | ENUM | DEFAULT NOT_INITIATED | Delivery lifecycle state |
| estimatedDelivery | DATETIME | NULLABLE | |
| deliveredAt | DATETIME | NULLABLE | Actual delivery timestamp |

#### `reviews`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR (CUID) | PK | |
| customerId | VARCHAR | FK → users.id | |
| vendorId | VARCHAR | FK → vendors.id | |
| foodItemId | VARCHAR | FK → food_items.id | |
| rating | INT | NOT NULL | 1–5 |
| comment | TEXT | NULLABLE | |
| isDeleted | BOOLEAN | DEFAULT false | Soft delete |
| — | — | UNIQUE(customerId, foodItemId) | One review per item per customer |

#### `otp_tokens`

| Column | Type | Description |
|---|---|---|
| id | VARCHAR (CUID) | PK |
| email | VARCHAR | Associated email |
| token | VARCHAR | 6-digit OTP |
| expiresAt | DATETIME | Expiry |
| used | BOOLEAN | Consumed flag |

### 10.3 ER Diagram (Text Representation)

```
USERS ──────────────── ADDRESSES
  │  1                     N
  │
  │  1 ── VENDOR ──────── FOOD_ITEMS ──── CATEGORIES
  │           │                │
  │           │                │
  │    ORDERS ┘        CART_ITEMS
  │      │   │
  │      │   └── ORDER_ITEMS (snapshot: name, price)
  │      │
  │      ├── PAYMENT    (1:1)
  │      └── DELIVERY   (1:1)
  │
  ├── CART ──── CART_ITEMS ──── FOOD_ITEMS
  │
  └── REVIEWS ──── FOOD_ITEMS
               └── VENDORS
```

### 10.4 Key Design Decisions

1. **Price snapshotting in `order_items`**: The `name` and `price` columns on `order_items` are denormalized copies captured at the moment of order placement. This ensures that if a vendor later changes a food item's price or name, all historical orders continue to display the correct values.

2. **Single-vendor cart enforcement**: The `Cart` model holds a `vendorId` field. When a customer adds the first item, `vendorId` is set. Any subsequent add from a different vendor is rejected at the service layer, maintaining cart integrity.

3. **Soft deletes**: Both `food_items` and `reviews` use an `isDeleted` boolean flag rather than physical row deletion. This preserves the referential integrity of `order_items` and `reviews` linked to those records.

4. **Refresh token storage**: The current refresh token is stored directly in the `users` table. When a new token is issued, it overwrites the previous value. This means a user can only have one active session at a time per account.

---

## 11. API Design

### 11.1 Design Principles

- All endpoints are prefixed with `/api/v1`.
- All responses follow a consistent envelope: `{ success: boolean, message: string, data: object | null }`.
- Validation errors return HTTP 400 with an `errors` array listing individual field-level messages.
- Authentication errors return HTTP 401; authorization failures return HTTP 403.
- Pagination is supported via `page` and `limit` query parameters on list endpoints.
- File uploads use `multipart/form-data`; all other requests use `application/json`.

### 11.2 Response Envelope

```json
// Success
{
  "success": true,
  "message": "Order placed successfully",
  "data": { "orderId": "clxyz...", "status": "PENDING_PAYMENT" }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": ["price must be a positive number", "name is required"]
}
```

### 11.3 Authentication Endpoints

```
POST   /api/v1/auth/register         Register new user (CUSTOMER or VENDOR)
POST   /api/v1/auth/login            Login, receive access + refresh tokens
POST   /api/v1/auth/refresh-token    Rotate tokens using refresh token
GET    /api/v1/auth/me               Get authenticated user profile
POST   /api/v1/auth/logout           Invalidate refresh token
POST   /api/v1/auth/change-password  Change password (authenticated)
```

**Register Request Body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "9876543210",
  "password": "SecurePass@123",
  "role": "CUSTOMER"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "Priya Sharma", "role": "CUSTOMER" },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 11.4 Vendor Endpoints

```
POST   /api/v1/vendors/register      Submit vendor application [auth, VENDOR]
GET    /api/v1/vendors/profile       Get own vendor profile [auth, VENDOR]
PUT    /api/v1/vendors/profile       Update vendor profile [auth, VENDOR]
GET    /api/v1/vendors/menu          Get own menu items [auth, VENDOR]
GET    /api/v1/vendors               List all APPROVED vendors [public]
GET    /api/v1/vendors/:id           Get vendor + menu [public]
```

### 11.5 Order Endpoints

```
POST   /api/v1/orders                Place new order [auth, CUSTOMER]
GET    /api/v1/orders                List orders (customer: own; vendor: received) [auth]
GET    /api/v1/orders/:id            Get order detail [auth]
POST   /api/v1/orders/:id/accept     Vendor accepts order [auth, VENDOR]
POST   /api/v1/orders/:id/reject     Vendor rejects order [auth, VENDOR]
PATCH  /api/v1/orders/:id/status     Vendor updates status [auth, VENDOR]
POST   /api/v1/orders/:id/cancel     Customer cancels order [auth, CUSTOMER]
```

**Place Order Request:**
```json
{
  "addressId": "clxyz...",
  "notes": "Less spicy please"
}
```

**Place Order Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "clxyz...",
    "total": "480.00",
    "status": "PENDING_PAYMENT",
    "items": [
      { "name": "Dal Makhani", "price": "180.00", "quantity": 2, "total": "360.00" },
      { "name": "Butter Roti", "price": "30.00", "quantity": 4, "total": "120.00" }
    ]
  }
}
```

### 11.6 Payment Endpoints

```
POST   /api/v1/payments/razorpay/order    Create Razorpay order [auth, CUSTOMER]
POST   /api/v1/payments/razorpay/verify   Verify payment signature [auth, CUSTOMER]
GET    /api/v1/payments/:orderId          Get payment record [auth]
```

**Payment Verification Request:**
```json
{
  "orderId": "clxyz...",
  "razorpayOrderId": "order_OAB123...",
  "razorpayPaymentId": "pay_OAB456...",
  "razorpaySignature": "abc123def456..."
}
```

### 11.7 Admin Endpoints

```
GET    /api/v1/admin/vendors              List all vendors with status [auth, ADMIN]
PATCH  /api/v1/admin/vendors/:id/status   Approve/reject/suspend vendor [auth, ADMIN]
GET    /api/v1/admin/orders               All platform orders [auth, ADMIN]
GET    /api/v1/admin/users                All users [auth, ADMIN]
GET    /api/v1/admin/analytics            Platform statistics [auth, ADMIN]
```

---

## 12. Order Processing Flow

The order lifecycle is managed through a finite state machine. The allowed transitions are strictly enforced at the service layer — no endpoint can skip a state.

### 12.1 Complete Order Flow

```
Step 1: Customer builds cart
────────────────────────────
Customer browses vendor menu and adds items.
Cart enforces single-vendor: Cart.vendorId is set
on first item add. Adding from another vendor
returns HTTP 400.

Step 2: Customer places order
──────────────────────────────
POST /api/v1/orders
  ├── Validates cart is non-empty
  ├── Validates addressId belongs to customer
  ├── Snapshots item name + price into order_items
  ├── Calculates subtotal, delivery fee, total
  ├── Creates Order with status: PENDING_PAYMENT
  ├── Clears the cart
  └── Returns orderId

Step 3: Payment initiation
───────────────────────────
POST /api/v1/payments/razorpay/order
  ├── Creates Razorpay order for the total amount
  ├── Creates Payment record (status: PENDING)
  └── Returns razorpayOrderId to client

Step 4: Customer pays
──────────────────────
Client launches Razorpay checkout UI.
Customer completes payment (card / UPI / netbanking).
Razorpay returns: razorpayOrderId, razorpayPaymentId,
                  razorpaySignature

Step 5: Payment verification (server-side)
───────────────────────────────────────────
POST /api/v1/payments/razorpay/verify
  ├── HMAC-SHA256 verify:
  │     expected_sig = HMAC(razorpayOrderId + "|" + razorpayPaymentId,
  │                         RAZORPAY_KEY_SECRET)
  ├── If signature matches:
  │     Payment.status → SUCCESS
  │     Order.status   → CONFIRMED
  └── If signature fails:
        Payment.status → FAILED
        Order.status   → PAYMENT_FAILED

Step 6: Vendor receives and accepts order
──────────────────────────────────────────
Vendor sees CONFIRMED order in dashboard.
POST /api/v1/orders/:id/accept
  └── Order.status → ACCEPTED

Step 7: Vendor prepares food
──────────────────────────────
PATCH /api/v1/orders/:id/status  { status: "PREPARING" }
  └── Order.status → PREPARING

Step 8: Food ready for pickup
──────────────────────────────
PATCH /api/v1/orders/:id/status  { status: "READY_FOR_PICKUP" }
  └── Order.status → READY_FOR_PICKUP

Step 9: Vendor creates shipment
────────────────────────────────
POST /api/v1/delivery/shiprocket/create
  ├── Creates shipment in Shiprocket
  ├── Stores: shiprocketOrderId, shiprocketShipmentId,
  │           awbCode, courierName, trackingUrl
  └── Delivery.status → PICKUP_SCHEDULED

Step 10: Delivery in progress
──────────────────────────────
Shiprocket assigns courier partner.
Delivery.status → PICKED_UP → IN_TRANSIT
Order.status    → OUT_FOR_DELIVERY

Step 11: Delivered
───────────────────
Delivery.status → DELIVERED
Order.status    → DELIVERED
Delivery.deliveredAt = timestamp

Step 12: Customer reviews
──────────────────────────
POST /api/v1/reviews
  ├── Validates order is DELIVERED
  ├── Validates customer placed that order
  └── Creates Review with rating + comment
```

### 12.2 Cancellation and Rejection Paths

```
Cancellation (by customer):
  Allowed only when: status is PENDING_PAYMENT or CONFIRMED
  POST /api/v1/orders/:id/cancel  { reason: "..." }
    └── Order.status → CANCELLED
        (Refund via Razorpay — planned for v2)

Rejection (by vendor):
  Allowed only when: status is CONFIRMED
  POST /api/v1/orders/:id/reject  { reason: "..." }
    └── Order.status → CANCELLED
        (Refund triggered — planned for v2)
```

---

## 13. Security Design

### 13.1 Authentication Architecture

HomeBite uses a **stateless JWT-based dual-token authentication** model.

**Access Token:**
- Algorithm: HS256 (HMAC-SHA256)
- Payload: `{ userId, role, iat, exp }`
- Expiry: 15 minutes
- Storage (client): Zustand memory store only (never persisted to disk or AsyncStorage)
- Usage: Sent with every API request in the `Authorization: Bearer <token>` header
- Verification: `auth` middleware extracts the token, verifies the signature and expiry, then queries the database to confirm the user exists and is not blocked

**Refresh Token:**
- Algorithm: HS256
- Payload: `{ userId, iat, exp }`
- Expiry: 7 days
- Storage (client): `expo-secure-store` (encrypted native secure storage)
- Storage (server): `users.refreshToken` column — one token per user
- Usage: Sent to `/auth/refresh-token` to obtain a new access/refresh token pair
- Rotation: Each use of a refresh token immediately invalidates it and issues a new one. If an already-used token is presented, it indicates token theft, and the server rejects it.

```
                 Client                          Server
                   │                               │
                   │  POST /auth/login             │
                   │──────────────────────────────>│
                   │                               │  verify credentials
                   │  { accessToken, refreshToken }│  store refreshToken in DB
                   │<──────────────────────────────│
                   │                               │
         store RT in SecureStore                   │
         store AT in Zustand (memory)              │
                   │                               │
                   │  GET /api/v1/... (AT valid)   │
                   │──────────────────────────────>│  verify AT signature
                   │  { data }                     │  check user.isBlocked
                   │<──────────────────────────────│
                   │                               │
         AT expires after 15 min                   │
                   │                               │
                   │  POST /auth/refresh-token     │
                   │  { refreshToken }             │
                   │──────────────────────────────>│  verify RT signature
                   │                               │  compare RT with DB value
                   │                               │  issue new AT + RT
                   │  { accessToken, refreshToken }│  update DB with new RT
                   │<──────────────────────────────│
```

### 13.2 Role-Based Access Control (RBAC)

Every API endpoint is protected by a combination of the `auth` middleware and the `roleGuard` middleware. There are three roles:

| Role | Numeric Level | Accessible Modules |
|---|---|---|
| CUSTOMER | Base | cart, orders (own), payments, delivery (read), reviews (write) |
| VENDOR | Elevated | food-items (own), orders (received), delivery (create shipment), vendors (own profile) |
| ADMIN | Superuser | admin module (all), full read access to all orders and users |

**Implementation:**
```
Route definition example:
  router.patch('/:id/status',
    auth,                          // must be logged in
    roleGuard('VENDOR'),           // must be VENDOR role
    validate(statusSchema),        // body must pass Joi schema
    controller.updateStatus
  );
```

The `roleGuard` middleware reads `req.user.role` (set by `auth` middleware) and compares it against the allowed roles list. If the role is not in the list, it returns `403 Forbidden`.

### 13.3 Input Validation

All request bodies are validated using **Joi** schemas declared in each module's route file. The `validate` middleware:
1. Validates the request body against the schema.
2. Strips all unknown fields (`stripUnknown: true`), preventing injection of unexpected fields.
3. Returns a `400 Bad Request` with detailed field-level error messages if validation fails.

This protects against mass assignment attacks and ensures only expected data reaches the service layer.

### 13.4 Payment Security

Razorpay payment verification is performed server-side using HMAC-SHA256:

```
expected_signature = HMAC_SHA256(
  razorpayOrderId + "|" + razorpayPaymentId,
  RAZORPAY_KEY_SECRET
)
```

If `expected_signature !== razorpaySignature`, the payment is rejected and the order is marked `PAYMENT_FAILED`. This prevents a client from fabricating a successful payment without going through Razorpay.

### 13.5 Additional Security Measures

| Measure | Implementation |
|---|---|
| HTTP Security Headers | Helmet middleware — X-Frame-Options, HSTS, CSP, X-XSS-Protection |
| Rate Limiting | 200 requests / IP / 15 minutes on all routes |
| CORS | Explicit `ALLOWED_ORIGINS` whitelist — rejects all unlisted origins |
| Password Hashing | bcrypt with 10 salt rounds — computationally expensive to brute-force |
| No Sensitive Data in Responses | `passwordHash` and `refreshToken` are never included in any API response (excluded via Prisma `select`) |
| Environment Variables | All secrets (JWT keys, DB credentials, payment keys) are stored in `.env` and excluded from version control via `.gitignore` |

---

## 14. Deployment Architecture

### 14.1 Production Environment Components

| Component | Technology | Responsibility |
|---|---|---|
| Mobile App | Expo EAS Build + App Stores | Android APK / iOS IPA distribution |
| Backend API | Node.js on cloud VM / container | REST API serving |
| Database | MySQL (managed cloud service) | Data persistence |
| File Storage | Cloud object storage (AWS S3) | Food item images |
| CDN | CloudFront / Cloudflare | Image delivery, SSL termination |
| Process Manager | PM2 | Process restart, clustering, logging |

### 14.2 Docker Deployment

**`homebite-backend/Dockerfile`:**
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

**`docker-compose.yml`:**
```yaml
version: "3.9"
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: homebite_db
      MYSQL_USER: homebite_user
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
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
    restart: unless-stopped

volumes:
  db_data:
  uploads_data:
```

### 14.3 Deployment Flow

```
Developer pushes to main branch
            │
            ▼
CI Pipeline (GitHub Actions)
  ├── Run linter
  ├── Run tests
  └── Build Docker image
            │
            ▼
Docker image pushed to registry
(AWS ECR / Docker Hub)
            │
            ▼
Production server pulls new image
  ├── docker-compose pull
  ├── docker-compose up -d
  └── npx prisma migrate deploy
            │
            ▼
Health check: GET /health → { status: "ok" }
```

### 14.4 Mobile App Distribution

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure builds
eas build:configure

# Build for Android (Play Store)
eas build --platform android --profile production

# Build for iOS (App Store)
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### 14.5 Environment Configuration Per Stage

| Variable | Development | Production |
|---|---|---|
| `NODE_ENV` | development | production |
| `DATABASE_URL` | Local MySQL | AWS RDS / PlanetScale |
| `JWT_ACCESS_SECRET` | Dev secret | Strong random (min 64 chars) |
| `RAZORPAY_KEY_ID` | Test key | Live key |
| `UPLOAD_DIR` | Local `uploads/` | AWS S3 bucket |
| `ALLOWED_ORIGINS` | localhost, LAN IP | Production app domain |

---

## 15. Future Enhancements

### 15.1 AI-Powered Food Recommendations

The current discovery model is category and dietary tag browsing. A recommendation engine would enhance discoverability by:

- **Collaborative filtering**: Recommending vendors and dishes based on the order history of users with similar taste profiles.
- **Contextual recommendations**: Suggesting breakfast vendors in the morning, lunch vendors at midday, and comfort food in the evening based on time-of-day patterns.
- **New user cold start**: Using the dietary preferences collected during registration to bootstrap initial recommendations before any order history exists.

**Implementation path**: Collect order history data → Build a recommendation microservice using Python (scikit-learn or TensorFlow) → Expose a `/api/v1/recommendations` endpoint → Integrate in the customer home screen.

### 15.2 Location-Based Vendor Discovery

The `Vendor` and `Address` models already store `lat` and `lng` coordinates. The infrastructure for geospatial filtering is in place; it requires:

- A customer location permission request on app launch (`expo-location`).
- A backend filter on `GET /api/v1/vendors` accepting `lat`, `lng`, and `radius` query parameters.
- A Haversine formula query (or MySQL spatial index with `ST_Distance_Sphere`) to return only vendors within the specified radius.
- A map view on the customer home screen showing nearby vendors using `react-native-maps`.

### 15.3 Real-Time Order Tracking

The current implementation requires the customer to manually refresh to see order status updates. A push notification and real-time update layer would significantly improve the experience:

- **Push notifications** via Expo Push Notifications or Firebase Cloud Messaging for status changes: order accepted, food ready, out for delivery, delivered.
- **WebSocket / Server-Sent Events** for a live order tracking screen that updates without polling.

### 15.4 Vendor Payout Management

Currently, vendor bank details and UPI IDs are stored but payouts are not automated. A payout module would:

- Track earnings per vendor per order.
- Schedule periodic payouts via Razorpay's Payout API or direct bank transfer.
- Provide vendors with a payout history and earnings dashboard.

### 15.5 OTP-Based Phone Verification

The `OtpToken` model is already in the schema. Completing this feature requires:

- Sending OTP via an SMS gateway (MSG91, Twilio) at registration and on sensitive operations (password reset).
- Verifying the OTP against the stored `OtpToken` record (with expiry and single-use enforcement).
- Setting `User.isEmailVerified = true` after successful verification.

### 15.6 Ratings and Reviews Enhancement

The current review system captures a rating and text comment. Future improvements:

- **Photo reviews**: Customers can attach a photo to their review.
- **Vendor response**: Vendors can publicly reply to reviews.
- **Review moderation**: Admins can soft-delete abusive or spam reviews.
- **Aggregated ratings**: Display average rating and rating distribution (1–5 star histogram) on vendor and food item cards.

### 15.7 Discount and Coupon System

- Vendor-specific promo codes with percentage or flat discounts.
- Platform-wide promotional codes managed by the admin.
- First-order discount for new customers.
- Minimum order value conditions on coupons.

### 15.8 Web Admin Dashboard

A dedicated React web application for admin operations would provide:

- Real-time platform analytics with charts (daily orders, revenue, new vendor registrations).
- Vendor approval queue with FSSAI document previews.
- User management with bulk action support.
- Order dispute resolution interface.

---

## 16. Conclusion

HomeBite addresses a genuine, underserved gap in the food technology ecosystem. While large platforms have focused on formalizing restaurant delivery, the home-cooked food segment — representing millions of skilled home cooks and an equally large audience of customers craving authentic, affordable meals — has had no structured digital home.

This project demonstrates the design and implementation of a production-grade, full-stack marketplace platform that solves this problem across its full scope: from vendor discovery and onboarding through ordering, payment, and delivery to post-delivery reviews.

**Key technical contributions of this project include:**

1. A modular, layered REST API architecture in Node.js and Express that cleanly separates routing, validation, business logic, and data access — making each concern independently testable and maintainable.

2. A JWT dual-token authentication system with rotation and reuse detection that provides both security (short-lived access tokens) and usability (long-lived, silent refresh).

3. A Prisma-managed relational database schema that models a complex, multi-party marketplace with proper foreign key constraints, soft deletes, and price snapshotting to maintain historical data integrity.

4. A React Native mobile application with role-based navigation, automatic token refresh, and a clean separation between API, state management, and UI layers.

5. Stubbed integrations with Razorpay and Shiprocket that implement the full API contract of the live services, allowing the platform to move from development to production with credential configuration alone — no structural code changes required.

The platform is architected for growth: the stateless backend supports horizontal scaling, the Prisma schema supports migration-driven evolution, and the mobile app's Expo build pipeline supports over-the-air updates and native store distribution.

HomeBite demonstrates that a complete, production-ready marketplace — covering authentication, multi-role access control, payment processing, logistics integration, and a mobile frontend — can be built as a cohesive, well-architected system using modern open-source technologies.

---

*End of Document*

---

> Document prepared for academic project submission. All system design, architecture, and implementation details are based on the actual HomeBite codebase.

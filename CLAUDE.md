# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repository Layout

Two independent sub-projects share this repo:

```
home-made-foodies/
├── homebite-backend/   # Node.js + Express REST API
└── homebite-app/       # React Native (Expo Router) mobile app
```

There is no shared `package.json` at the root. All commands must be run from inside the relevant sub-project directory.

---

## Backend Commands (`cd homebite-backend`)

```bash
npm run dev              # Start dev server with nodemon (port 5000)
npm start                # Start production server

npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Create and apply a new migration (prompts for name)
npm run prisma:seed      # Seed admin, vendor, customer accounts
npm run prisma:studio    # Open Prisma Studio (visual DB browser)
```

There is no test runner configured. No linter is configured.

Health check: `GET http://localhost:5000/health`

---

## Mobile App Commands (`cd homebite-app`)

```bash
npm start           # Start Expo Metro bundler (scan QR with Expo Go)
npm run android     # Launch on Android emulator
npm run ios         # Launch on iOS simulator
npm run web         # Launch in browser
```

There is no test runner or linter configured.

**Device testing:** Set `EXPO_PUBLIC_API_URL` to the host machine's LAN IP (e.g. `http://192.168.x.x:5000/api/v1`) — `localhost` is unreachable from a physical device.

---

## Backend Architecture

### Module Structure

Every feature follows a strict three-file pattern inside `src/modules/<module>/`:

```
<module>.routes.js      # Express Router — declares endpoints, applies middleware
<module>.controller.js  # Calls service, returns response via apiResponse helpers
<module>.service.js     # All business logic and direct Prisma queries
```

**Controllers must stay thin.** Business logic belongs exclusively in services. Services throw plain `Error` objects with a `statusCode` property; the global `errorHandler` middleware picks these up automatically.

### Key Middleware (applied in this order in `app.js`)

| Middleware | File | Purpose |
|---|---|---|
| `auth` | `middleware/auth.js` | Verifies Bearer JWT, attaches `req.user = { id, role, isBlocked }` |
| `roleGuard(...roles)` | `middleware/roleGuard.js` | Checks `req.user.role` against allowed roles |
| `validate(joiSchema)` | `middleware/validate.js` | Validates `req.body` with Joi; strips unknown fields |
| `upload` | `middleware/upload.js` | Multer for food item image uploads |
| `errorHandler` | `middleware/errorHandler.js` | Global catch-all; reads `err.statusCode` |

### Response Shape

All responses use `src/utils/apiResponse.js`:

```js
// Success
{ success: true, message: "...", data: {...} }       // 200
{ success: true, message: "...", data: {...} }       // 201 via apiResponse.created()

// Error
{ success: false, message: "...", errors: [...] }   // errors field only on validation failures
```

Always use `asyncHandler` from `src/utils/asyncHandler.js` to wrap async controller functions.

### Authentication Flow

- Access token: JWT signed with `JWT_ACCESS_SECRET`, expires in 15 minutes
- Refresh token: JWT signed with `JWT_REFRESH_SECRET`, expires in 7 days, stored in the `User.refreshToken` DB column
- Token rotation: each `/auth/refresh-token` call issues a new refresh token and invalidates the old one (reuse detection is in place)
- `req.user` only contains `{ id, role, isBlocked }` — not the full user record

### Route Protection Pattern

```js
router.post('/some-route',
  auth,                          // must be authenticated
  roleGuard('VENDOR', 'ADMIN'),  // must have one of these roles
  validate(joiSchema),           // body must pass schema
  controller.method
);
```

### Database

- MySQL via Prisma ORM. Schema lives in `prisma/schema.prisma`.
- After any schema change: run `npm run prisma:generate` then `npm run prisma:migrate`.
- The Prisma client singleton is exported from `src/config/database.js`.
- Order items snapshot `name` and `price` at placement time — do not rely on `FoodItem` for historical order data.
- Cart enforces single-vendor: `Cart.vendorId` must match all `CartItem` entries.

### Vendor Approval Workflow

`VendorStatus`: `PENDING → APPROVED | REJECTED` (admin action), can be moved to `SUSPENDED`.
Only `APPROVED` vendors are visible in public `/vendors` listings.

### Payment & Delivery (Stubs)

Razorpay and Shiprocket are fully stubbed in `payment.service.js` and `delivery.service.js`. The stub methods match the live API signatures exactly — replacing them with live SDK calls requires no interface changes.

---

## Mobile App Architecture

### Routing

Expo Router uses file-based routing. The `app/` directory maps directly to URL paths:

- `app/(auth)/` — unauthenticated screens (login, register)
- `app/(customer)/` — customer tab stack
- `app/(vendor)/` — vendor stack
- `app/(admin)/` — admin stack

**Session restoration and role-based redirect** happen in `app/_layout.tsx`: on mount it attempts to restore a session from `expo-secure-store`, calls `/auth/me`, then redirects to the correct role stack.

### State Management

Two Zustand stores in `src/store/`:

- `authStore.ts` — `user`, `accessToken`, `isAuthenticated`, `isLoading`, `setAuth`, `setAccessToken`, `logout`
- `cartStore.ts` — cart items, totals, add/remove/clear actions

### API Layer

All HTTP calls go through `src/api/axiosInstance.ts`, which:
1. Injects the access token from `authStore` on every request
2. Automatically retries on 401 by calling `/auth/refresh-token`, queuing concurrent requests during refresh
3. Calls `authStore.logout()` and clears stored tokens if refresh fails

Module-specific API functions live in `src/api/<module>.api.ts` and import this instance.

### Token Storage

- **Access token**: held only in Zustand memory (not persisted to disk)
- **Refresh token**: persisted in `expo-secure-store` via `src/utils/storage.ts`

### Form Validation

Forms use `react-hook-form` + `zod` for schema validation. Resolver: `@hookform/resolvers/zod`.

---

## Seed Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@homebite.com | Admin@123 |
| Customer | customer@test.com | Customer@123 |
| Vendor | vendor@test.com | Vendor@123 |

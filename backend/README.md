# PharmaWorld Backend

NestJS REST API powering the PharmaWorld pharmacy e-commerce ecosystem.

## Overview

Scalable, modular backend with role-based access control, real-time notifications, payment processing, and comprehensive business logic for pharmacy operations.

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** NestJS 10
- **Database:** MongoDB (Mongoose ODM)
- **Cache:** Redis
- **Auth:** JWT + Firebase Admin SDK
- **Payments:** Razorpay SDK
- **Storage:** Cloudinary + AWS S3
- **Validation:** class-validator + class-transformer
- **Testing:** Jest + Supertest

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run start:dev

# Start with debug
npm run start:debug
```

Server runs on `http://localhost:3000` by default.

## Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── app.controller.ts          # Root controller
├── config/                    # Configuration modules
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── firebase.config.ts
├── modules/
│   ├── auth/                  # Authentication & users
│   ├── medicines/             # Medicine catalog
│   ├── categories/            # Medicine categories
│   ├── brands/                # Pharmaceutical brands
│   ├── cart/                  # Shopping cart
│   ├── orders/                # Order processing
│   ├── payments/              # Payment gateway
│   ├── delivery/              # Delivery management
│   ├── coupons/               # Discount coupons
│   ├── wallet/                # Digital wallet
│   ├── reviews/               # Reviews & ratings
│   ├── notifications/         # Push notifications
│   ├── offers/                # Promotions
│   ├── banners/               # Homepage banners
│   ├── referrals/             # Referral program
│   ├── support/               # Customer support
│   ├── returns/               # Returns & exchanges
│   ├── addresses/             # User addresses
│   ├── search/                # Search engine
│   ├── analytics/             # Analytics & reports
│   ├── audit/                 # Audit logging
│   ├── settings/              # System settings
│   ├── uploads/               # File uploads
│   └── health/                # Health checks
└── common/
    ├── guards/                # Auth & RBAC guards
    ├── pipes/                 # Validation pipes
    ├── decorators/            # Custom decorators
    ├── filters/               # Exception filters
    ├── interceptors/          # Logging & transform
    └── middleware/            # Rate limiting, CORS
```

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register        # Register new user
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/refresh         # Refresh token
GET    /api/v1/auth/profile         # Get profile
PUT    /api/v1/auth/profile         # Update profile
POST   /api/v1/auth/forgot-password # Request password reset
POST   /api/v1/auth/reset-password  # Reset password
POST   /api/v1/auth/change-password # Change password
POST   /api/v1/auth/verify-email    # Verify email
```

### Medicines
```
GET    /api/v1/medicines            # List all (with pagination, filters)
GET    /api/v1/medicines/:id        # Get single medicine
POST   /api/v1/medicines            # Create (Admin/Pharmacist)
PUT    /api/v1/medicines/:id        # Update (Admin/Pharmacist)
DELETE /api/v1/medicines/:id        # Delete (Admin)
GET    /api/v1/medicines/search     # Search medicines
GET    /api/v1/medicines/category/:id # Get by category
```

### Categories
```
GET    /api/v1/categories           # List all categories
GET    /api/v1/categories/:id       # Get single category
POST   /api/v1/categories           # Create (Admin)
PUT    /api/v1/categories/:id       # Update (Admin)
DELETE /api/v1/categories/:id       # Delete (Admin)
```

### Brands
```
GET    /api/v1/brands               # List all brands
GET    /api/v1/brands/:id           # Get single brand
POST   /api/v1/brands               # Create (Admin)
PUT    /api/v1/brands/:id           # Update (Admin)
DELETE /api/v1/brands/:id           # Delete (Admin)
```

### Cart
```
GET    /api/v1/cart                  # Get user cart
POST   /api/v1/cart/add              # Add item to cart
PUT    /api/v1/cart/update           # Update item quantity
DELETE /api/v1/cart/remove/:itemId   # Remove item from cart
DELETE /api/v1/cart/clear            # Clear entire cart
```

### Orders
```
GET    /api/v1/orders                # Get all orders (Admin)
GET    /api/v1/orders/my             # Get my orders
GET    /api/v1/orders/:id            # Get single order
POST   /api/v1/orders                # Create order
PUT    /api/v1/orders/:id/status     # Update status (Admin)
DELETE /api/v1/orders/:id/cancel     # Cancel order
POST   /api/v1/orders/:id/return     # Request return
```

### Payments
```
POST   /api/v1/payments/create-order    # Create Razorpay order
POST   /api/v1/payments/verify          # Verify payment
POST   /api/v1/payments/cod             # Process COD
GET    /api/v1/payments/:orderId        # Get payment for order
GET    /api/v1/payments/history         # Payment history
POST   /api/v1/payments/refund/:id      # Process refund (Admin)
```

### Wallet
```
GET    /api/v1/wallet                   # Get wallet balance
GET    /api/v1/wallet/transactions       # Transaction history
POST   /api/v1/wallet/add-money         # Add money to wallet
POST   /api/v1/wallet/pay               # Pay using wallet
GET    /api/v1/wallet/:userId           # Get user wallet (Admin)
```

### Coupons
```
GET    /api/v1/coupons                  # List all coupons (Admin)
POST   /api/v1/coupons                  # Create coupon (Admin)
PUT    /api/v1/coupons/:id              # Update coupon (Admin)
DELETE /api/v1/coupons/:id              # Delete coupon (Admin)
POST   /api/v1/coupons/validate         # Validate coupon code
```

### Delivery
```
GET    /api/v1/delivery/available        # Available deliveries (Driver)
POST   /api/v1/delivery/:id/accept      # Accept delivery (Driver)
PUT    /api/v1/delivery/:id/status       # Update delivery status
GET    /api/v1/delivery/:id/track        # Track delivery
GET    /api/v1/delivery/my               # My deliveries (Driver)
```

### Reviews
```
GET    /api/v1/reviews/medicine/:id     # Get medicine reviews
POST   /api/v1/reviews                  # Create review
PUT    /api/v1/reviews/:id              # Update review
DELETE /api/v1/reviews/:id              # Delete review
```

### Notifications
```
GET    /api/v1/notifications            # Get user notifications
PUT    /api/v1/notifications/:id/read   # Mark as read
PUT    /api/v1/notifications/read-all   # Mark all as read
DELETE /api/v1/notifications/:id        # Delete notification
```

### Other Modules
```
# Offers, Banners, Referrals, Support, Returns,
# Addresses, Search, Analytics, Audit, Settings, Uploads, Health
# See docs/API.md for complete endpoint documentation
```

## Authentication

### JWT Token Flow
1. User registers/logs in
2. Server returns `access_token` (JWT)
3. Client sends `Authorization: Bearer <token>` header
4. Server validates token and attaches user to request

### Roles & Permissions
| Role | Access Level |
|------|-------------|
| `super_admin` | Full system access |
| `admin` | Pharmacy management |
| `pharmacist` | Medicine management |
| `driver` | Delivery operations |
| `customer` | Standard user access |

## Error Handling

All errors follow consistent format:

```json
{
  "statusCode": 400,
  "message": ["Validation failed: email must be an email"],
  "error": "Bad Request",
  "timestamp": "2026-07-13T10:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

### Common Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 403 | Forbidden / Insufficient Permissions |
| 404 | Resource Not Found |
| 409 | Conflict (Duplicate Entry) |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## Database Schema

Key collections:
- **users** - User accounts with roles
- **medicines** - Medicine catalog
- **categories** - Medicine categories
- **brands** - Pharmaceutical brands
- **carts** - Shopping carts
- **orders** - Order records
- **payments** - Payment transactions
- **wallets** - User wallets
- **wallet_transactions** - Wallet transaction history
- **coupons** - Discount coupons
- **reviews** - Product reviews
- **notifications** - Push notifications
- **addresses** - User addresses
- **deliveries** - Delivery records
- **audit_logs** - System audit trail

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Deployment

### Vercel
```bash
vercel --prod
```

### Docker
```bash
docker build -t pharmaworld-backend .
docker run -p 3000:3000 pharmaworld-backend
```

### Docker Compose
```bash
docker-compose up -d
```

## Scripts

```bash
npm run start:dev      # Development server
npm run start:debug    # Debug mode
npm run build          # Build for production
npm run start:prod     # Start production build
npm run lint           # Run ESLint
npm run format         # Format with Prettier
npm run test           # Run unit tests
npm run test:e2e       # Run E2E tests
npm run test:cov       # Run with coverage
```

## License

Proprietary. All rights reserved.

# PharmaWorld Architecture

## System Overview

PharmaWorld follows a microservices-inspired modular monolith architecture with clear separation of concerns across four client applications and one backend API.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Mobile   │  │ Dashboard│  │ Super    │  │ Driver App       │   │
│  │ (Flutter)│  │ (Flutter │  │ Admin    │  │ (Flutter)        │   │
│  │ Android/ │  │  Web)    │  │ (Flutter │  │ Android          │   │
│  │ iOS      │  │          │  │  Web)    │  │                  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬──────────┘   │
│       │              │              │                │               │
│       └──────────────┴──────────────┴────────────────┘               │
│                              │                                       │
│                        HTTP/REST                                     │
│                              │                                       │
├──────────────────────────────┼───────────────────────────────────────┤
│                         API Gateway                                  │
│                    (Rate Limiting, CORS)                              │
│                              │                                       │
├──────────────────────────────┼───────────────────────────────────────┤
│                                                                      │
│                        Backend Layer                                  │
│                    (NestJS Modular Monolith)                          │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Auth     │  │ Medicines│  │ Orders   │  │ Payments         │   │
│  │ Module   │  │ Module   │  │ Module   │  │ Module           │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Cart     │  │ Delivery │  │ Wallet   │  │ Notifications    │   │
│  │ Module   │  │ Module   │  │ Module   │  │ Module           │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Coupons  │  │ Reviews  │  │ Support  │  │ Analytics        │   │
│  │ Module   │  │ Module   │  │ Module   │  │ Module           │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                        Data Layer                                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ MongoDB      │  │ Redis    │  │ Cloudin. │  │ Firebase      │  │
│  │ Atlas        │  │ Cache    │  │ (Images) │  │ (FCM + Auth)  │  │
│  └──────────────┘  └──────────┘  └──────────┘  └───────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Clean Architecture Layers

The backend follows NestJS modular architecture with Clean Architecture principles:

```
┌─────────────────────────────────────────────────┐
│                Presentation Layer                 │
│  Controllers, DTOs, Pipes, Guards, Interceptors  │
├─────────────────────────────────────────────────┤
│                Application Layer                  │
│  Services, Use Cases, Business Logic              │
├─────────────────────────────────────────────────┤
│                Domain Layer                       │
│  Schemas, Entities, Interfaces, Enums             │
├─────────────────────────────────────────────────┤
│                Infrastructure Layer               │
│  Database, Cache, Email, Storage, External APIs   │
└─────────────────────────────────────────────────┘
```

### Module Structure (per module)

```
module/
├── module.module.ts          # NestJS module definition
├── module.controller.ts      # HTTP route handlers
├── module.service.ts         # Business logic
├── dto/
│   ├── create-*.dto.ts       # Request validation DTOs
│   └── update-*.dto.ts
├── schemas/
│   └── *.schema.ts           # Mongoose schemas & interfaces
├── __tests__/
│   └── *.service.spec.ts     # Unit tests
└── interfaces/
    └── *.interface.ts         # Module-specific interfaces
```

## Data Flow Diagrams

### User Registration Flow

```
Client → POST /auth/register → AuthController
    → AuthService.register()
        → Check email uniqueness (UserModel)
        → Hash password (bcrypt)
        → Create user (UserModel)
        → Generate JWT token
        → Send welcome notification (NotificationsService)
    → Return { access_token, user }
Client ← 201 Created
```

### Medicine Browsing Flow

```
Client → GET /medicines?page=1&category=cat1 → MedicinesController
    → MedicinesService.findAll()
        → Check Redis cache
        → If cache miss: Query MongoDB with filters
        → Populate category, brand refs
        → Cache results in Redis
    → Return paginated results
Client ← 200 OK
```

### Order Placement Flow

```
Client → POST /orders → OrdersController
    → OrdersService.create()
        → Validate user exists
        → Validate all medicines exist & are active
        → Check stock availability for each item
        → Calculate subtotal, delivery charge
        → Apply coupon if provided (CouponsService.validate)
        → Deduct loyalty points if redeemed
        → Create order document
        → Decrease medicine stock atomically
        → Clear user cart
        → Send order confirmation notification
    → Return order details
Client ← 201 Created
    → Redirect to payment (Razorpay/Wallet/COD)
```

### Payment Flow (Razorpay)

```
Client → POST /payments/create-order → PaymentsController
    → PaymentsService.createRazorpayOrder()
        → Fetch order details
        → Create Razorpay order via SDK
        → Save payment record
    → Return { razorpayOrderId, amount, key }
Client ← 200 OK

Client → Razorpay Checkout Widget → Payment

Client → POST /payments/verify → PaymentsController
    → PaymentsService.verifyPayment()
        → Verify signature using HMAC
        → Update payment status to 'completed'
        → Update order payment status
        → Credit loyalty points
        → Send payment confirmation notification
    → Return success
Client ← 200 OK
```

### Delivery Assignment Flow

```
Admin → PUT /orders/:id/status { status: "confirmed" } → OrdersController
    → OrdersService.updateStatus()
        → Validate status transition
        → Create delivery record
        → Assign to nearest available driver
        → Send notification to driver

Driver → GET /delivery/available → DeliveryController
    → Return available deliveries near driver location

Driver → POST /delivery/:id/accept → DeliveryController
    → DeliveryService.accept()
        → Assign driver to delivery
        → Update order status to "shipped"
        → Notify customer

Driver → PUT /delivery/:id/status { status: "delivered" }
    → DeliveryService.updateStatus()
        → Update delivery status
        → Update order status to "delivered"
        → Confirm payment (if COD)
        → Credit wallet cashback
        → Send delivery confirmation to customer
```

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │   Medicine    │     │   Category    │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ _id          │     │ _id           │     │ _id           │
│ firstName    │     │ name          │     │ name          │
│ lastName     │     │ genericName   │     │ slug          │
│ email        │     │ description   │     │ description   │
│ password     │     │ price         │     │ image         │
│ phone        │     │ mrp           │     │ isActive      │
│ role         │     │ stock         │     │ order         │
│ isActive     │     │ sku           │     └──────┬───────┘
│ loyaltyPoints│     │ dosage        │            │
│ referralCode │     │ form          │            │ 1:N
│ profileImage │     │ packSize      │     ┌──────┴───────┐
└──────┬──────┘     │ requiresRx    │     │  Medicine     │
       │            │ images        │     └──────┬───────┘
       │            │ categoryId FK │            │
       │            │ brandId FK    │     ┌──────┴───────┐
       │            │ manufacturerFK│     │    Brand      │
       │            │ averageRating │     ├──────────────┤
       │            │ isActive      │     │ _id           │
       │            └──────────────┘     │ name          │
       │                                  │ logo          │
       ├── 1:N ┌──────────────┐          │ description   │
       │       │    Cart       │          └──────────────┘
       │       ├──────────────┤
       │       │ _id          │     ┌──────────────────┐
       │       │ userId FK    │     │     Order         │
       │       │ items[]      │     ├──────────────────┤
       │       └──────────────┘     │ _id               │
       │                            │ orderNumber       │
       ├── 1:N ┌──────────────┐     │ userId FK         │
       │       │    Order      │◄───│ items[]           │
       │       │ (see below)  │     │ shippingAddress   │
       │       └──────────────┘     │ subtotal          │
       │                            │ deliveryCharge    │
       ├── 1:1 ┌──────────────┐     │ discount          │
       │       │    Wallet     │     │ totalAmount       │
       │       ├──────────────┤     │ paymentMethod     │
       │       │ _id          │     │ paymentStatus     │
       │       │ userId FK    │     │ status            │
       │       │ balance      │     │ couponCode        │
       │       │ isActive     │     │ notes             │
       │       └──────────────┘     │ createdAt         │
       │                            └──────────────────┘
       ├── 1:N ┌──────────────┐            │
       │       │   Address     │     ┌──────┴───────┐
       │       ├──────────────┤     │   Payment     │
       │       │ _id          │     ├──────────────┤
       │       │ userId FK    │     │ _id           │
       │       │ label        │     │ orderId FK    │
       │       │ fullName     │     │ userId FK     │
       │       │ street       │     │ amount        │
       │       │ city         │     │ method        │
       │       │ state        │     │ status        │
       │       │ pincode      │     │ razorpayData  │
       │       │ isDefault    │     │ createdAt     │
       │       └──────────────┘     └──────────────┘
       │
       ├── 1:N ┌──────────────┐     ┌──────────────────┐
       │       │   Review      │     │ WalletTransaction │
       │       ├──────────────┤     ├──────────────────┤
       │       │ _id          │     │ _id               │
       │       │ userId FK    │     │ walletId FK       │
       │       │ medicineId FK│     │ type              │
       │       │ rating       │     │ amount            │
       │       │ title        │     │ description       │
       │       │ comment      │     │ reference         │
       │       └──────────────┘     │ status            │
       │                            └──────────────────┘
       └── 1:N ┌──────────────┐
               │ Notification  │
               ├──────────────┤
               │ _id          │
               │ userId FK    │
               │ type         │
               │ title        │
               │ body         │
               │ data         │
               │ isRead       │
               └──────────────┘
```

### Key Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true })
db.users.createIndex({ referralCode: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ isActive: 1 })

// Medicines
db.medicines.createIndex({ name: "text", genericName: "text", description: "text" })
db.medicines.createIndex({ sku: 1 }, { unique: true })
db.medicines.createIndex({ categoryId: 1 })
db.medicines.createIndex({ brandId: 1 })
db.medicines.createIndex({ price: 1 })
db.medicines.createIndex({ isActive: 1, stock: 1 })

// Orders
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: -1 })

// Payments
db.payments.createIndex({ orderId: 1 })
db.payments.createIndex({ userId: 1 })
db.payments.createIndex({ razorpayOrderId: 1 })

// Cart
db.carts.createIndex({ userId: 1 }, { unique: true })

// Wallet
db.wallets.createIndex({ userId: 1 }, { unique: true })
db.wallet_transactions.createIndex({ walletId: 1, createdAt: -1 })

// Reviews
db.reviews.createIndex({ medicineId: 1, userId: 1 }, { unique: true })

// Notifications
db.notifications.createIndex({ userId: 1, createdAt: -1 })
db.notifications.createIndex({ userId: 1, isRead: 1 })

// Addresses
db.addresses.createIndex({ userId: 1 })
db.addresses.createIndex({ "location": "2dsphere" })
```

## Authentication Flow

```
┌────────┐          ┌────────┐          ┌────────┐
│ Client │          │ Server │          │Database│
└───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │
    │  1. POST /auth/login                  │
    │──────────────────>│                   │
    │                   │  2. Find user     │
    │                   │──────────────────>│
    │                   │  3. User found    │
    │                   │<──────────────────│
    │                   │                   │
    │                   │  4. Compare       │
    │                   │     password      │
    │                   │  (bcrypt)         │
    │                   │                   │
    │                   │  5. Generate JWT  │
    │                   │     { sub, role,  │
    │                   │       exp }       │
    │                   │                   │
    │  6. Return token  │                   │
    │<──────────────────│                   │
    │                   │                   │
    │  7. GET /api/v1/medicines             │
    │  Authorization: Bearer <token>        │
    │──────────────────>│                   │
    │                   │  8. JwtStrategy   │
    │                   │     validates     │
    │                   │                   │
    │                   │  9. RolesGuard    │
    │                   │     checks role   │
    │                   │                   │
    │  10. Return data  │                   │
    │<──────────────────│                   │
```

### JWT Token Structure

```json
{
  "sub": "user123",
  "email": "john@example.com",
  "role": "customer",
  "iat": 1626168000,
  "exp": 1626772800
}
```

### Role Hierarchy

```
super_admin
    ├── admin (pharmacy level)
    │     ├── pharmacist
    │     └── (manages medicines, orders)
    ├── driver
    │     └── (manages deliveries)
    └── customer
          └── (standard access)
```

## Order Lifecycle

```
                        ┌─────────────┐
                        │   Pending    │
                        └──────┬──────┘
                               │ Customer places order
                               ▼
                        ┌─────────────┐
                  ┌─────│  Confirmed  │─────┐
                  │     └──────┬──────┘     │
                  │            │            │
            Cancel│     Pharmacy reviews   │ Cancel
                  │            │            │
                  ▼            ▼            ▼
           ┌──────────┐ ┌──────────┐ ┌──────────┐
           │ Cancelled │ │Processing│ │ Cancelled │
           └──────────┘ └────┬─────┘ └──────────┘
                              │ Packed
                              ▼
                       ┌──────────┐
                       │ Shipped  │
                       └────┬─────┘
                            │ Driver assigned
                            ▼
                     ┌──────────────┐
                     │Out for       │
                     │Delivery      │
                     └──────┬───────┘
                            │ Delivered
                            ▼
                     ┌──────────────┐
                     │  Delivered   │
                     └──────┬───────┘
                            │
                            ├── Return requested (within 7 days)
                            ▼
                     ┌──────────────┐
                     │   Returned   │
                     └──────────────┘
```

## Security Measures

### 1. Authentication & Authorization
- JWT tokens with short expiration (7 days)
- Refresh token rotation
- Role-based access control (RBAC)
- Account lockout after failed attempts

### 2. Input Validation
- class-validator on all DTOs
- Whitelist stripping of unknown properties
- Request size limits
- MongoDB query sanitization

### 3. Rate Limiting
- Global rate limit: 100 req/min
- Auth endpoints: 10 req/min
- IP-based tracking
- Configurable per endpoint

### 4. Data Protection
- Passwords hashed with bcrypt (12 rounds)
- Sensitive data excluded from responses
- Environment variables for secrets
- HTTPS enforced in production

### 5. API Security
- CORS configured for specific origins
- Helmet headers
- Request ID tracking
- Audit logging for admin actions

### 6. Payment Security
- Razorpay signature verification
- HMAC validation
- Idempotent payment processing
- PCI DSS compliance via Razorpay

### 7. Infrastructure
- MongoDB Atlas encryption at rest
- Redis password authentication
- Cloudinary signed URLs
- Firebase Admin SDK for server auth

### 8. Monitoring
- Health check endpoints
- Error tracking with stack traces
- Performance metrics logging
- Audit trail for all mutations

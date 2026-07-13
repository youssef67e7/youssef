# PharmaWorld API Documentation

Base URL:
```
Development: http://localhost:3000/api/v1
Production:  https://pharmaworld-api.vercel.app/api/v1
```

All responses use JSON format. Authentication via Bearer token in `Authorization` header.

---

## Table of Contents

1. [Auth](#auth)
2. [Users](#users)
3. [Medicines](#medicines)
4. [Categories](#categories)
5. [Brands](#brands)
6. [Cart](#cart)
7. [Orders](#orders)
8. [Payments](#payments)
9. [Delivery](#delivery)
10. [Coupons](#coupons)
11. [Wallet](#wallet)
12. [Loyalty](#loyalty)
13. [Reviews](#reviews)
14. [Notifications](#notifications)
15. [Offers](#offers)
16. [Banners](#banners)
17. [Referrals](#referrals)
18. [Support](#support)
19. [Returns/Exchange](#returnsexchange)
20. [Addresses](#addresses)
21. [Search](#search)
22. [Analytics](#analytics)
23. [Reports](#reports)
24. [Audit](#audit)
25. [Settings](#settings)
26. [Uploads](#uploads)
27. [Health](#health)

---

## Auth

### POST /auth/register
Register a new user account.

**Auth Required:** No

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Secure@123",
  "phone": "+919876543210",
  "role": "customer"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "isActive": true,
    "loyaltyPoints": 0,
    "createdAt": "2026-07-13T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Validation error
- `409` - Email or phone already exists

---

### POST /auth/login
Authenticate user and return JWT token.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Secure@123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "customer",
    "profileImage": "https://cdn.cloudinary.com/..."
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Account deactivated

---

### POST /auth/refresh
Refresh access token using refresh token.

**Auth Required:** No

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### GET /auth/profile
Get current user profile.

**Auth Required:** Yes

**Response (200):**
```json
{
  "_id": "user123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "role": "customer",
  "isActive": true,
  "loyaltyPoints": 150,
  "walletBalance": 500,
  "addresses": [...],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

### PUT /auth/profile
Update current user profile.

**Auth Required:** Yes

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "+919876543211"
}
```

**Response (200):**
```json
{
  "_id": "user123",
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "+919876543211"
}
```

---

### POST /auth/forgot-password
Request password reset email.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password
Reset password using token from email.

**Auth Required:** No

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecure@123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

---

### POST /auth/change-password
Change current password.

**Auth Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

### POST /auth/verify-email
Verify email address with OTP.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

## Users

### GET /users
List all users (Admin only).

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `role` (string: customer|admin|pharmacist|driver)
- `search` (string)
- `isActive` (boolean)

**Response (200):**
```json
{
  "data": [
    {
      "_id": "user123",
      "firstName": "John",
      "email": "john@example.com",
      "role": "customer",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

---

### GET /users/:id
Get user by ID (Admin only).

**Auth Required:** Yes (Admin)

**Response (200):**
```json
{
  "_id": "user123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "role": "customer",
  "isActive": true,
  "totalOrders": 5,
  "totalSpent": 2500,
  "loyaltyPoints": 150,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

### PUT /users/:id/status
Activate/deactivate user (Admin only).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "isActive": false,
  "reason": "Account suspended"
}
```

**Response (200):**
```json
{
  "message": "User status updated",
  "user": { "_id": "user123", "isActive": false }
}
```

---

## Medicines

### GET /medicines
List all medicines with pagination and filters.

**Auth Required:** No

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `category` (string, category ID)
- `brand` (string, brand ID)
- `search` (string, search term)
- `minPrice` (number)
- `maxPrice` (number)
- `sortBy` (string: price|name|createdAt|rating)
- `sortOrder` (string: asc|desc)
- `inStock` (boolean)
- `requiresPrescription` (boolean)

**Response (200):**
```json
{
  "data": [
    {
      "_id": "med123",
      "name": "Paracetamol 500mg",
      "genericName": "Acetaminophen",
      "description": "Pain relief tablets",
      "price": 25.00,
      "mrp": 30.00,
      "discount": 16.67,
      "stock": 100,
      "sku": "PARA500",
      "dosage": "500mg",
      "form": "tablet",
      "requiresPrescription": false,
      "isActive": true,
      "images": ["https://cdn.cloudinary.com/..."],
      "category": {
        "_id": "cat1",
        "name": "Pain Relief"
      },
      "brand": {
        "_id": "brand1",
        "name": "Cipla"
      },
      "averageRating": 4.5,
      "totalReviews": 25
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 20,
  "totalPages": 25
}
```

---

### GET /medicines/:id
Get single medicine details.

**Auth Required:** No

**Response (200):**
```json
{
  "_id": "med123",
  "name": "Paracetamol 500mg",
  "genericName": "Acetaminophen",
  "description": "Paracetamol is a widely used over-the-counter pain reliever and fever reducer. It works by inhibiting the production of prostaglandins in the brain.",
  "composition": "Each tablet contains Paracetamol IP 500mg",
  "price": 25.00,
  "mrp": 30.00,
  "stock": 100,
  "sku": "PARA500",
  "dosage": "500mg",
  "form": "tablet",
  "packSize": "10 tablets",
  "requiresPrescription": false,
  "sideEffects": ["Nausea", "Allergic reactions (rare)"],
  "storageInstructions": "Store in a cool, dry place",
  "manufacturer": {
    "_id": "mfr1",
    "name": "Cipla Ltd"
  },
  "category": {
    "_id": "cat1",
    "name": "Pain Relief"
  },
  "brand": {
    "_id": "brand1",
    "name": "Cipla"
  },
  "images": ["https://cdn.cloudinary.com/..."],
  "averageRating": 4.5,
  "totalReviews": 25,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

### POST /medicines
Create a new medicine (Admin/Pharmacist).

**Auth Required:** Yes (Admin/Pharmacist)

**Request Body:**
```json
{
  "name": "Paracetamol 500mg",
  "genericName": "Acetaminophen",
  "description": "Pain relief tablets",
  "composition": "Each tablet contains Paracetamol IP 500mg",
  "price": 25.00,
  "mrp": 30.00,
  "stock": 100,
  "sku": "PARA500",
  "dosage": "500mg",
  "form": "tablet",
  "packSize": "10 tablets",
  "requiresPrescription": false,
  "categoryId": "cat1",
  "brandId": "brand1",
  "manufacturerId": "mfr1",
  "images": ["https://example.com/image.jpg"],
  "sideEffects": ["Nausea"],
  "storageInstructions": "Store in cool place"
}
```

**Response (201):**
```json
{
  "_id": "med456",
  "name": "Paracetamol 500mg",
  "sku": "PARA500",
  "price": 25.00,
  "stock": 100,
  "isActive": true,
  "createdAt": "2026-07-13T10:00:00.000Z"
}
```

---

### PUT /medicines/:id
Update a medicine (Admin/Pharmacist).

**Auth Required:** Yes (Admin/Pharmacist)

**Request Body:** Partial fields to update.

**Response (200):**
```json
{
  "_id": "med123",
  "name": "Paracetamol 500mg",
  "price": 22.00,
  "stock": 150,
  "updatedAt": "2026-07-13T12:00:00.000Z"
}
```

---

### DELETE /medicines/:id
Delete a medicine (Admin only).

**Auth Required:** Yes (Admin)

**Response (200):**
```json
{
  "message": "Medicine deleted successfully"
}
```

---

### GET /medicines/search?q=paracetamol
Search medicines by name, generic name, or description.

**Auth Required:** No

**Query Parameters:**
- `q` (string, required) - Search term
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "results": [
    {
      "_id": "med123",
      "name": "Paracetamol 500mg",
      "genericName": "Acetaminophen",
      "price": 25.00,
      "images": ["..."],
      "category": { "name": "Pain Relief" }
    }
  ]
}
```

---

## Categories

### GET /categories
List all categories.

**Auth Required:** No

**Response (200):**
```json
{
  "data": [
    {
      "_id": "cat1",
      "name": "Pain Relief",
      "slug": "pain-relief",
      "description": "Medicines for pain relief",
      "image": "https://cdn.cloudinary.com/...",
      "isActive": true,
      "medicineCount": 45,
      "order": 1
    }
  ]
}
```

---

### GET /categories/:id
Get single category with medicines.

**Auth Required:** No

---

### POST /categories
Create category (Admin).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Pain Relief",
  "description": "Medicines for pain relief",
  "image": "https://example.com/cat-image.jpg",
  "order": 1
}
```

---

### PUT /categories/:id
Update category (Admin).

**Auth Required:** Yes (Admin)

---

### DELETE /categories/:id
Delete category (Admin).

**Auth Required:** Yes (Admin)

---

## Brands

### GET /brands
List all brands.

**Auth Required:** No

**Response (200):**
```json
{
  "data": [
    {
      "_id": "brand1",
      "name": "Cipla",
      "slug": "cipla",
      "logo": "https://cdn.cloudinary.com/...",
      "description": "Leading pharmaceutical company",
      "isActive": true,
      "medicineCount": 120
    }
  ]
}
```

---

### GET /brands/:id
Get single brand with medicines.

**Auth Required:** No

---

### POST /brands
Create brand (Admin).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Cipla",
  "logo": "https://example.com/logo.png",
  "description": "Leading pharmaceutical company"
}
```

---

### PUT /brands/:id
Update brand (Admin).

**Auth Required:** Yes (Admin)

---

### DELETE /brands/:id
Delete brand (Admin).

**Auth Required:** Yes (Admin)

---

## Cart

### GET /cart
Get current user's cart.

**Auth Required:** Yes

**Response (200):**
```json
{
  "_id": "cart123",
  "items": [
    {
      "_id": "item1",
      "medicine": {
        "_id": "med123",
        "name": "Paracetamol 500mg",
        "price": 25.00,
        "images": ["..."],
        "stock": 100
      },
      "quantity": 2,
      "subtotal": 50.00
    }
  ],
  "totalItems": 2,
  "totalAmount": 50.00
}
```

---

### POST /cart/add
Add item to cart.

**Auth Required:** Yes

**Request Body:**
```json
{
  "medicineId": "med123",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "message": "Item added to cart",
  "cart": {
    "totalItems": 3,
    "totalAmount": 75.00
  }
}
```

**Errors:**
- `400` - Insufficient stock
- `404` - Medicine not found

---

### PUT /cart/update
Update cart item quantity.

**Auth Required:** Yes

**Request Body:**
```json
{
  "itemId": "item1",
  "quantity": 3
}
```

---

### DELETE /cart/remove/:itemId
Remove item from cart.

**Auth Required:** Yes

**Response (200):**
```json
{
  "message": "Item removed from cart"
}
```

---

### DELETE /cart/clear
Clear entire cart.

**Auth Required:** Yes

**Response (200):**
```json
{
  "message": "Cart cleared"
}
```

---

## Orders

### POST /orders
Create a new order.

**Auth Required:** Yes

**Request Body:**
```json
{
  "addressId": "addr123",
  "paymentMethod": "razorpay",
  "couponCode": "WELCOME10",
  "notes": "Leave at door"
}
```

**Response (201):**
```json
{
  "_id": "order123",
  "orderNumber": "PW-2026-00001",
  "items": [
    {
      "medicineId": "med123",
      "name": "Paracetamol 500mg",
      "quantity": 2,
      "price": 25.00,
      "total": 50.00
    }
  ],
  "subtotal": 50.00,
  "deliveryCharge": 0,
  "discount": 5.00,
  "totalAmount": 45.00,
  "paymentMethod": "razorpay",
  "status": "pending",
  "paymentStatus": "pending",
  "estimatedDelivery": "2026-07-15T18:00:00.000Z",
  "createdAt": "2026-07-13T10:00:00.000Z"
}
```

---

### GET /orders
List all orders (Admin). With filters for status, date range, etc.

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `page`, `limit`
- `status` (pending|confirmed|processing|shipped|delivered|cancelled)
- `startDate`, `endDate`
- `search` (order number, customer name)

---

### GET /orders/my
Get current user's orders.

**Auth Required:** Yes

**Response (200):**
```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

---

### GET /orders/:id
Get single order details.

**Auth Required:** Yes

---

### PUT /orders/:id/status
Update order status (Admin).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "status": "confirmed",
  "note": "Order confirmed by pharmacy"
}
```

**Status flow:** `pending` → `confirmed` → `processing` → `shipped` → `out_for_delivery` → `delivered`

---

### DELETE /orders/:id/cancel
Cancel an order.

**Auth Required:** Yes

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

---

### POST /orders/:id/return
Request return for delivered order.

**Auth Required:** Yes

**Request Body:**
```json
{
  "reason": "Wrong product received",
  "items": ["med123"],
  "images": ["https://example.com/proof.jpg"]
}
```

---

## Payments

### POST /payments/create-order
Create a Razorpay order for payment.

**Auth Required:** Yes

**Request Body:**
```json
{
  "orderId": "order123",
  "amount": 45.00
}
```

**Response (200):**
```json
{
  "orderId": "rzp_order_xxxxx",
  "amount": 4500,
  "currency": "INR",
  "key": "rzp_test_xxxxx"
}
```

---

### POST /payments/verify
Verify Razorpay payment.

**Auth Required:** Yes

**Request Body:**
```json
{
  "razorpay_order_id": "rzp_order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "xxxxx"
}
```

**Response (200):**
```json
{
  "status": "completed",
  "paymentId": "pay123",
  "message": "Payment verified successfully"
}
```

---

### POST /payments/cod
Process Cash on Delivery order.

**Auth Required:** Yes

**Request Body:**
```json
{
  "orderId": "order123"
}
```

---

### GET /payments/history
Get payment history for current user.

**Auth Required:** Yes

---

### POST /payments/refund/:id
Process refund (Admin).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "reason": "Order cancelled by customer",
  "amount": 45.00
}
```

---

## Delivery

### GET /delivery/available
Get available deliveries for driver.

**Auth Required:** Yes (Driver)

**Response (200):**
```json
{
  "data": [
    {
      "_id": "del123",
      "orderNumber": "PW-2026-00001",
      "pickupAddress": {
        "street": "123 Pharmacy St",
        "city": "Mumbai",
        "pincode": "400001"
      },
      "dropAddress": {
        "fullName": "John Doe",
        "street": "456 Customer Ave",
        "city": "Mumbai",
        "pincode": "400002"
      },
      "amount": 45.00,
      "distance": 3.2,
      "estimatedTime": "15 min"
    }
  ]
}
```

---

### POST /delivery/:id/accept
Accept a delivery (Driver).

**Auth Required:** Yes (Driver)

---

### PUT /delivery/:id/status
Update delivery status.

**Auth Required:** Yes (Driver)

**Request Body:**
```json
{
  "status": "picked_up",
  "location": {
    "lat": 19.0760,
    "lng": 72.8777
  }
}
```

**Status flow:** `assigned` → `picked_up` → `in_transit` → `delivered`

---

### GET /delivery/:id/track
Track delivery in real-time.

**Auth Required:** Yes

**Response (200):**
```json
{
  "_id": "del123",
  "status": "in_transit",
  "driverLocation": {
    "lat": 19.0760,
    "lng": 72.8777,
    "updatedAt": "2026-07-13T14:30:00.000Z"
  },
  "estimatedArrival": "2026-07-13T14:45:00.000Z",
  "statusHistory": [
    { "status": "assigned", "time": "2026-07-13T14:00:00Z" },
    { "status": "picked_up", "time": "2026-07-13T14:10:00Z" },
    { "status": "in_transit", "time": "2026-07-13T14:15:00Z" }
  ]
}
```

---

### GET /delivery/my
Get driver's delivery history.

**Auth Required:** Yes (Driver)

---

## Coupons

### GET /coupons
List all coupons (Admin).

**Auth Required:** Yes (Admin)

---

### POST /coupons
Create a coupon (Admin).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "code": "WELCOME10",
  "description": "10% off on first order",
  "discountType": "percentage",
  "discountValue": 10,
  "minimumOrderAmount": 200,
  "maximumDiscount": 50,
  "usageLimit": 1000,
  "validFrom": "2026-07-01",
  "validUntil": "2026-12-31",
  "firstOrderOnly": true,
  "applicableCategories": [],
  "excludeCategories": []
}
```

---

### PUT /coupons/:id
Update coupon (Admin).

**Auth Required:** Yes (Admin)

---

### DELETE /coupons/:id
Delete coupon (Admin).

**Auth Required:** Yes (Admin)

---

### POST /coupons/validate
Validate a coupon code.

**Auth Required:** Yes

**Request Body:**
```json
{
  "code": "WELCOME10",
  "orderAmount": 500
}
```

**Response (200):**
```json
{
  "valid": true,
  "discount": 50,
  "discountType": "percentage",
  "description": "10% off - Maximum ₹50",
  "finalAmount": 450
}
```

---

## Wallet

### GET /wallet
Get current user's wallet balance.

**Auth Required:** Yes

**Response (200):**
```json
{
  "_id": "wallet123",
  "balance": 500.00,
  "currency": "INR",
  "isActive": true
}
```

---

### GET /wallet/transactions
Get wallet transaction history.

**Auth Required:** Yes

**Query Parameters:**
- `page`, `limit`
- `type` (credit|debit)

**Response (200):**
```json
{
  "data": [
    {
      "_id": "txn123",
      "type": "credit",
      "amount": 100,
      "description": "Cashback for order #PW-2026-001",
      "reference": "order123",
      "balance": 600,
      "createdAt": "2026-07-13T10:00:00.000Z"
    }
  ],
  "total": 25,
  "balance": 500
}
```

---

### POST /wallet/add-money
Add money to wallet via Razorpay.

**Auth Required:** Yes

**Request Body:**
```json
{
  "amount": 500
}
```

---

### POST /wallet/pay
Pay using wallet balance.

**Auth Required:** Yes

**Request Body:**
```json
{
  "orderId": "order123",
  "amount": 200
}
```

---

## Loyalty

### GET /loyalty
Get loyalty points summary.

**Auth Required:** Yes

**Response (200):**
```json
{
  "points": 150,
  "tier": "Gold",
  "tierBenefits": ["Free delivery", "5% extra discount"],
  "pointsExpiring": 50,
  "expiryDate": "2026-08-01T00:00:00.000Z",
  "history": [
    {
      "type": "earned",
      "points": 50,
      "description": "Order #PW-2026-001",
      "date": "2026-07-13T00:00:00.000Z"
    }
  ]
}
```

---

### POST /loyalty/redeem
Redeem loyalty points.

**Auth Required:** Yes

**Request Body:**
```json
{
  "points": 100,
  "orderId": "order123"
}
```

---

## Reviews

### GET /reviews/medicine/:medicineId
Get reviews for a medicine.

**Auth Required:** No

**Response (200):**
```json
{
  "data": [
    {
      "_id": "rev123",
      "user": {
        "_id": "user123",
        "firstName": "John",
        "profileImage": "..."
      },
      "rating": 5,
      "title": "Very effective",
      "comment": "Worked great for my headache",
      "isVerifiedPurchase": true,
      "helpfulCount": 12,
      "createdAt": "2026-07-13T10:00:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 25,
  "ratingDistribution": {
    "5": 15,
    "4": 5,
    "3": 3,
    "2": 1,
    "1": 1
  }
}
```

---

### POST /reviews
Create a review.

**Auth Required:** Yes

**Request Body:**
```json
{
  "medicineId": "med123",
  "rating": 5,
  "title": "Very effective",
  "comment": "Worked great for my headache"
}
```

---

### PUT /reviews/:id
Update a review.

**Auth Required:** Yes (Owner)

---

### DELETE /reviews/:id
Delete a review.

**Auth Required:** Yes (Owner/Admin)

---

## Notifications

### GET /notifications
Get user notifications.

**Auth Required:** Yes

**Query Parameters:**
- `page`, `limit`
- `isRead` (boolean)

**Response (200):**
```json
{
  "data": [
    {
      "_id": "notif123",
      "type": "order_status",
      "title": "Order Confirmed",
      "body": "Your order #PW-2026-001 has been confirmed",
      "data": { "orderId": "order123" },
      "isRead": false,
      "createdAt": "2026-07-13T10:00:00.000Z"
    }
  ],
  "total": 50,
  "unreadCount": 5
}
```

---

### PUT /notifications/:id/read
Mark notification as read.

**Auth Required:** Yes

---

### PUT /notifications/read-all
Mark all notifications as read.

**Auth Required:** Yes

---

### DELETE /notifications/:id
Delete notification.

**Auth Required:** Yes

---

## Offers

### GET /offers
List active offers.

**Auth Required:** No

---

### POST /offers
Create offer (Admin).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "title": "Summer Sale",
  "description": "Up to 30% off on wellness products",
  "discountType": "percentage",
  "discountValue": 30,
  "applicableCategories": ["cat1", "cat2"],
  "validFrom": "2026-06-01",
  "validUntil": "2026-08-31",
  "bannerImage": "https://example.com/offer-banner.jpg"
}
```

---

### PUT /offers/:id
Update offer (Admin).

---

### DELETE /offers/:id
Delete offer (Admin).

---

## Banners

### GET /banners
List active homepage banners.

**Auth Required:** No

**Response (200):**
```json
{
  "data": [
    {
      "_id": "banner123",
      "title": "Summer Health Sale",
      "image": "https://cdn.cloudinary.com/...",
      "link": "/offers/summer-sale",
      "order": 1,
      "isActive": true
    }
  ]
}
```

---

### POST /banners
Create banner (Admin).

**Auth Required:** Yes (Admin)

---

### PUT /banners/:id
Update banner (Admin).

---

### DELETE /banners/:id
Delete banner (Admin).

---

## Referrals

### GET /referrals
Get user's referral info.

**Auth Required:** Yes

**Response (200):**
```json
{
  "referralCode": "JOHN123",
  "referralLink": "https://pharmaworld.com/ref/JOHN123",
  "totalReferrals": 5,
  "totalEarned": 500,
  "pendingRewards": 200,
  "referralHistory": [
    {
      "referredUser": "Jane D.",
      "status": "completed",
      "reward": 100,
      "date": "2026-07-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /referrals/apply
Apply referral code during registration.

**Auth Required:** No

**Request Body:**
```json
{
  "referralCode": "JOHN123"
}
```

---

## Support

### POST /support/tickets
Create a support ticket.

**Auth Required:** Yes

**Request Body:**
```json
{
  "subject": "Order not received",
  "description": "My order #PW-2026-001 was marked delivered but I haven't received it",
  "category": "delivery",
  "orderId": "order123",
  "priority": "high",
  "attachments": ["https://example.com/screenshot.jpg"]
}
```

---

### GET /support/tickets
Get user's support tickets.

**Auth Required:** Yes

---

### GET /support/tickets/:id
Get single ticket with messages.

**Auth Required:** Yes

---

### POST /support/tickets/:id/reply
Reply to a support ticket.

**Auth Required:** Yes

**Request Body:**
```json
{
  "message": "I still haven't received any update",
  "attachments": []
}
```

---

### PUT /support/tickets/:id/status
Update ticket status (Admin).

**Auth Required:** Yes (Admin)

---

## Returns/Exchange

### POST /returns
Request return/exchange.

**Auth Required:** Yes

**Request Body:**
```json
{
  "orderId": "order123",
  "type": "return",
  "items": [
    {
      "medicineId": "med123",
      "quantity": 1,
      "reason": "Damaged product"
    }
  ],
  "reason": "Product arrived damaged",
  "images": ["https://example.com/photo1.jpg"]
}
```

---

### GET /returns
Get user's return requests.

**Auth Required:** Yes

---

### GET /returns/:id
Get single return request details.

**Auth Required:** Yes

---

### PUT /returns/:id/status
Update return status (Admin).

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "status": "approved",
  "refundAmount": 25.00,
  "note": "Return approved. Refund will be processed in 3-5 days."
}
```

---

## Addresses

### GET /addresses
Get user's saved addresses.

**Auth Required:** Yes

**Response (200):**
```json
{
  "data": [
    {
      "_id": "addr123",
      "label": "Home",
      "fullName": "John Doe",
      "phone": "+919876543210",
      "street": "123 Main Street",
      "landmark": "Near Park",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "isDefault": true,
      "location": {
        "type": "Point",
        "coordinates": [72.8777, 19.0760]
      }
    }
  ]
}
```

---

### POST /addresses
Add a new address.

**Auth Required:** Yes

**Request Body:**
```json
{
  "label": "Home",
  "fullName": "John Doe",
  "phone": "+919876543210",
  "street": "123 Main Street",
  "landmark": "Near Park",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "isDefault": true
}
```

---

### PUT /addresses/:id
Update an address.

**Auth Required:** Yes

---

### DELETE /addresses/:id
Delete an address.

**Auth Required:** Yes

---

### PUT /addresses/:id/default
Set address as default.

**Auth Required:** Yes

---

## Search

### GET /search
Global search across medicines, categories, brands.

**Auth Required:** No

**Query Parameters:**
- `q` (string, required) - Search term
- `type` (string: all|medicines|categories|brands)

**Response (200):**
```json
{
  "medicines": [
    { "_id": "med123", "name": "Paracetamol", "price": 25.00 }
  ],
  "categories": [
    { "_id": "cat1", "name": "Pain Relief" }
  ],
  "brands": [
    { "_id": "brand1", "name": "Cipla" }
  ],
  "suggestions": ["paracetamol 500mg", "paracetamol syrup"]
}
```

---

### GET /search/suggestions
Get search suggestions/autocomplete.

**Auth Required:** No

**Query Parameters:**
- `q` (string, required)

**Response (200):**
```json
{
  "suggestions": [
    "Paracetamol 500mg",
    "Paracetamol 650mg",
    "Paracetamol Syrup"
  ]
}
```

---

## Analytics

### GET /analytics/dashboard
Get dashboard analytics (Admin).

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `period` (string: today|week|month|year)

**Response (200):**
```json
{
  "totalOrders": 150,
  "totalRevenue": 75000,
  "totalUsers": 1200,
  "totalMedicines": 500,
  "ordersTrend": [
    { "date": "2026-07-07", "count": 20, "revenue": 10000 },
    { "date": "2026-07-08", "count": 25, "revenue": 12500 }
  ],
  "topMedicines": [...],
  "recentOrders": [...],
  "lowStockMedicines": [...]
}
```

---

### GET /analytics/sales
Get sales analytics (Admin).

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `startDate`, `endDate`
- `groupBy` (day|week|month)

---

### GET /analytics/users
Get user analytics (Admin).

**Auth Required:** Yes (Admin)

---

## Reports

### GET /reports/sales
Generate sales report (Admin).

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `startDate`, `endDate`
- `format` (json|csv|pdf)

---

### GET /reports/inventory
Generate inventory report (Admin).

**Auth Required:** Yes (Admin)

---

### GET /reports/orders
Generate orders report (Admin).

**Auth Required:** Yes (Admin)

---

### GET /reports/revenue
Generate revenue report (Admin).

**Auth Required:** Yes (Admin)

---

## Audit

### GET /audit/logs
Get audit logs (Admin).

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `page`, `limit`
- `action` (string)
- `userId` (string)
- `startDate`, `endDate`

**Response (200):**
```json
{
  "data": [
    {
      "_id": "log123",
      "action": "medicine.update",
      "entity": "Medicine",
      "entityId": "med123",
      "user": { "_id": "admin123", "name": "Admin User" },
      "changes": {
        "price": { "old": 25.00, "new": 22.00 }
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-07-13T10:00:00.000Z"
    }
  ],
  "total": 500
}
```

---

## Settings

### GET /settings
Get system settings.

**Auth Required:** Yes (Admin)

**Response (200):**
```json
{
  "siteName": "PharmaWorld",
  "deliveryCharge": 0,
  "freeDeliveryMinOrder": 200,
  "minOrderAmount": 100,
  "maxDeliveryDistance": 15,
  "loyaltyPointsPerRupee": 0.1,
  "referralBonus": 100,
  "refereeBonus": 50,
  "supportedPaymentMethods": ["razorpay", "cod", "wallet"],
  "deliverySlots": ["9:00-12:00", "12:00-18:00", "18:00-21:00"]
}
```

---

### PUT /settings
Update system settings (Super Admin).

**Auth Required:** Yes (Super Admin)

---

## Uploads

### POST /uploads/image
Upload an image file.

**Auth Required:** Yes

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| file | File | Image file (jpg, png, webp) |
| folder | String | Upload folder (medicines, banners, profiles) |

**Response (200):**
```json
{
  "url": "https://cdn.cloudinary.com/...",
  "publicId": "pharmaworld/medicines/abc123",
  "width": 800,
  "height": 600
}
```

---

### POST /uploads/prescription
Upload prescription image.

**Auth Required:** Yes

---

### DELETE /uploads/:publicId
Delete uploaded file.

**Auth Required:** Yes

---

## Health

### GET /health
Health check endpoint.

**Auth Required:** No

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-07-13T10:00:00.000Z",
  "uptime": 86400,
  "database": {
    "status": "connected",
    "latency": 2
  },
  "redis": {
    "status": "connected",
    "latency": 1
  },
  "version": "1.0.0",
  "environment": "production"
}
```

---

### GET /health/ready
Readiness check (Kubernetes).

**Auth Required:** No

**Response (200):**
```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "memory": "ok"
  }
}
```

---

### GET /health/live
Liveness check (Kubernetes).

**Auth Required:** No

**Response (200):**
```json
{
  "status": "alive"
}
```

---

## Rate Limiting

API endpoints are rate-limited:
- **General endpoints:** 100 requests/minute
- **Auth endpoints:** 10 requests/minute
- **Upload endpoints:** 20 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1626168000
```

## Pagination

All list endpoints support pagination:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 10 | Items per page |

Response includes:
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

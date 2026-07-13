# PharmaWorld Dashboard

Web-based pharmacy admin panel built with Flutter Web.

## Features

- Dashboard overview with sales analytics
- Medicine catalog management (CRUD)
- Category & brand management
- Order management & status updates
- Inventory tracking & low stock alerts
- Coupon & promotion management
- Customer management
- Revenue reports & analytics
- Banner & offer management
- Customer support ticket system
- Delivery assignment & tracking
- User role management

## Tech Stack

- **Framework:** Flutter Web 3.22
- **State Management:** Riverpod
- **Charts:** fl_chart
- **Data Tables:** data_table_2
- **HTTP Client:** Dio
- **PDF Generation:** pdf

## Getting Started

```bash
# Install dependencies
flutter pub get

# Run in Chrome
flutter run -d chrome

# Build for web
flutter build web --release
```

## Project Structure

```
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── routes.dart
│   └── theme.dart
├── core/
│   ├── constants/
│   ├── network/
│   ├── services/
│   └── widgets/
├── features/
│   ├── dashboard/
│   ├── medicines/
│   ├── orders/
│   ├── customers/
│   ├── analytics/
│   ├── coupons/
│   ├── settings/
│   └── support/
└── shared/
    ├── models/
    ├── providers/
    └── repositories/
```

## Deployment

```bash
# Build optimized web
flutter build web --release --base-href /

# Deploy to Firebase Hosting
firebase deploy --only hosting:dashboard
```

## License

Proprietary. All rights reserved.

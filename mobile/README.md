# PharmaWorld Mobile App

Customer-facing Flutter application for Android and iOS.

## Features

- Browse & search medicines by name, category, brand
- Filter & sort medicines
- Add to cart & checkout
- Multiple payment methods (Razorpay, COD, Wallet)
- Order tracking with real-time delivery status
- Wallet management & transaction history
- Loyalty points & rewards
- Referral system
- Medicine reminders & notifications
- User profiles & address management
- Medicine reviews & ratings
- Prescription upload
- Customer support tickets
- Offer & coupon management

## Tech Stack

- **Framework:** Flutter 3.22
- **State Management:** Riverpod
- **Navigation:** GoRouter
- **HTTP Client:** Dio
- **Local Storage:** Hive
- **Push Notifications:** Firebase Cloud Messaging
- **Maps:** Google Maps Flutter
- **Payments:** Razorpay Flutter SDK

## Getting Started

```bash
# Install dependencies
flutter pub get

# Run on connected device
flutter run

# Run on specific device
flutter run -d <device-id>

# Build debug APK
flutter build apk --debug

# Build release APK
flutter build apk --release
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
│   │   ├── api_client.dart
│   │   └── interceptors.dart
│   ├── services/
│   ├── utils/
│   └── widgets/
├── features/
│   ├── auth/
│   ├── home/
│   ├── medicines/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── wallet/
│   ├── profile/
│   ├── notifications/
│   ├── reviews/
│   ├── support/
│   ├── referrals/
│   └── offers/
└── shared/
    ├── models/
    ├── providers/
    └── repositories/
```

## Environment Configuration

Create `lib/core/config/env.dart`:

```dart
class Env {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3000/api/v1',
  );
  static const String googleMapsKey = String.fromEnvironment(
    'GOOGLE_MAPS_KEY',
    defaultValue: '',
  );
}
```

### Build Variants

```bash
# Development
flutter run --dart-define=API_URL=http://localhost:3000/api/v1

# Staging
flutter run --dart-define=API_URL=https://staging-api.pharmaworld.com/api/v1

# Production
flutter run --dart-define=API_URL=https://pharmaworld-api.vercel.app/api/v1
```

## Build Commands

```bash
# Android APK (Release)
flutter build apk --release

# Android App Bundle (for Play Store)
flutter build appbundle --release

# iOS (requires macOS + Xcode)
flutter build ios --release

# Web
flutter build web --release
```

## License

Proprietary. All rights reserved.

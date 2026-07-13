# PharmaWorld Driver App

Flutter mobile application for delivery partners.

## Features

- View available deliveries nearby
- Accept/reject delivery requests
- Navigate to pickup & drop locations
- Update delivery status (picked up, in transit, delivered)
- Delivery history & earnings tracker
- Daily/weekly/monthly earnings summary
- Profile management
- Bank details for payouts
- Real-time order notifications
- Route optimization
- Delivery proof (photo/signature)

## Tech Stack

- **Framework:** Flutter 3.22
- **State Management:** Riverpod
- **Maps:** Google Maps Flutter + Directions API
- **Location:** geolocator
- **HTTP Client:** Dio
- **Push Notifications:** Firebase Cloud Messaging

## Getting Started

```bash
# Install dependencies
flutter pub get

# Run on connected device
flutter run

# Build APK
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
│   ├── services/
│   └── utils/
├── features/
│   ├── auth/
│   ├── home/
│   ├── deliveries/
│   ├── earnings/
│   ├── navigation/
│   ├── profile/
│   └── notifications/
└── shared/
    ├── models/
    ├── providers/
    └── repositories/
```

## Deployment

```bash
# Build release APK
flutter build apk --release

# Build for Play Store
flutter build appbundle --release
```

## License

Proprietary. All rights reserved.

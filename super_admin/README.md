# PharmaWorld Super Admin

Platform-level management web app built with Flutter Web.

## Features

- System-wide dashboard & analytics
- Manage all pharmacies
- Manage all users (customers, admins, drivers, pharmacists)
- Assign & manage pharmacy roles
- System settings & configurations
- Global offers & banner management
- Platform-wide reports & exports
- Revenue & commission management
- Delivery zone configuration
- Audit log viewer
- System health monitoring
- Role-based access control management
- Notification templates
- FAQ & content management

## Tech Stack

- **Framework:** Flutter Web 3.22
- **State Management:** Riverpod
- **Charts:** fl_chart
- **Data Tables:** data_table_2
- **HTTP Client:** Dio
- **PDF/Excel Export:** pdf, excel

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
│   ├── pharmacies/
│   ├── users/
│   ├── settings/
│   ├── reports/
│   ├── audit/
│   ├── notifications/
│   └── content/
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
firebase deploy --only hosting:superadmin
```

## License

Proprietary. All rights reserved.

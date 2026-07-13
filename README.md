# PharmaWorld

A complete pharmacy e-commerce ecosystem with mobile app, admin dashboard, super admin panel, driver app, and scalable NestJS backend.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PharmaWorld Ecosystem                     │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Mobile App  │  Dashboard   │  Super Admin │     Driver App     │
│  (Flutter)   │  (Flutter)   │  (Flutter)   │     (Flutter)      │
│  Customer    │  Pharmacy    │  Platform    │    Delivery        │
│  iOS/Android │  Web         │  Web         │    Android         │
├──────────────┴──────────────┴──────────────┴────────────────────┤
│                      NestJS REST API                             │
│  Auth │ Orders │ Medicine │ Payments │ Wallet │ Delivery │ More │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Atlas  │  Redis Cache  │  Firebase  │  Razorpay/COD    │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | Flutter 3.22 | Customer app (Android/iOS) |
| **Dashboard** | Flutter Web | Pharmacy admin panel |
| **Super Admin** | Flutter Web | Platform management |
| **Driver App** | Flutter | Delivery partner app |
| **Backend** | NestJS (Node.js) | REST API server |
| **Database** | MongoDB Atlas | Primary data store |
| **Cache** | Redis | Session & query caching |
| **Auth** | JWT + Firebase | Authentication & FCM |
| **Payments** | Razorpay + COD | Payment processing |
| **Storage** | Cloudinary + S3 | Image & file storage |
| **CI/CD** | GitHub Actions | Automated pipelines |
| **Deploy** | Vercel + Firebase | Hosting & functions |

## Apps Overview

### Mobile App (`mobile/`)
Customer-facing Flutter app for browsing medicines, placing orders, tracking deliveries, wallet management, and loyalty rewards.

### Dashboard (`dashboard/`)
Web-based pharmacy admin panel for managing medicines, orders, inventory, coupons, analytics, and customer support.

### Super Admin (`super_admin/`)
Platform-level management for all pharmacies, drivers, users, system settings, reports, and global configurations.

### Driver App (`driver_app/`)
Flutter app for delivery partners to accept deliveries, navigate to customers, update delivery status, and track earnings.

## Project Structure

```
pharmaworld/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Authentication & user management
│   │   │   ├── medicines/   # Medicine catalog & inventory
│   │   │   ├── categories/  # Medicine categories
│   │   │   ├── brands/      # Pharmaceutical brands
│   │   │   ├── cart/        # Shopping cart
│   │   │   ├── orders/      # Order processing
│   │   │   ├── payments/    # Payment gateway integration
│   │   │   ├── delivery/    # Delivery management
│   │   │   ├── coupons/     # Discount coupons
│   │   │   ├── wallet/      # User wallet & transactions
│   │   │   ├── reviews/     # Product reviews & ratings
│   │   │   ├── notifications/ # Push & in-app notifications
│   │   │   ├── offers/      # Promotional offers
│   │   │   ├── banners/     # Homepage banners
│   │   │   ├── referrals/   # Referral system
│   │   │   ├── support/     # Customer support tickets
│   │   │   ├── returns/     # Returns & exchanges
│   │   │   ├── addresses/   # Saved addresses
│   │   │   ├── search/      # Full-text search
│   │   │   ├── analytics/   # Analytics & reporting
│   │   │   ├── audit/       # Audit logs
│   │   │   ├── settings/    # System settings
│   │   │   ├── uploads/     # File uploads
│   │   │   └── health/      # Health checks
│   │   ├── common/
│   │   │   ├── guards/      # Auth & roles guards
│   │   │   ├── pipes/       # Validation pipes
│   │   │   ├── decorators/  # Custom decorators
│   │   │   ├── filters/     # Exception filters
│   │   │   ├── interceptors/ # Logging & transform
│   │   │   └── middleware/  # Rate limiting, CORS
│   │   └── config/          # App, database, Redis config
│   ├── test/                # E2E tests
│   └── package.json
├── mobile/                  # Flutter customer app
├── dashboard/               # Flutter pharmacy dashboard
├── super_admin/             # Flutter super admin panel
├── driver_app/              # Flutter driver app
├── docs/                    # Documentation
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Local development stack
└── README.md
```

## Prerequisites

- **Node.js** >= 20.x
- **Flutter** >= 3.22
- **MongoDB** >= 7.0 (or Atlas)
- **Redis** >= 7.0
- **Docker** & Docker Compose (optional)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/pharmaworld.git
cd pharmaworld
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### 3. Mobile App Setup

```bash
cd mobile
flutter pub get
flutter run
```

### 4. Dashboard Setup

```bash
cd dashboard
flutter pub get
flutter run -d chrome
```

### 5. Driver App Setup

```bash
cd driver_app
flutter pub get
flutter run
```

### 6. Docker Setup (Alternative)

```bash
docker-compose up -d
```

This starts MongoDB, Redis, and the backend server.

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for complete guide.

## API Documentation

Full API docs are available at [docs/API.md](docs/API.md).

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://pharmaworld-api.vercel.app/api/v1
```

### Key Endpoints

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| Auth | `/auth/register` | POST | Register new user |
| Auth | `/auth/login` | POST | Login |
| Medicines | `/medicines` | GET | List all medicines |
| Medicines | `/medicines/:id` | GET | Get medicine details |
| Orders | `/orders` | POST | Create order |
| Orders | `/orders` | GET | Get my orders |
| Cart | `/cart` | GET | Get cart |
| Payments | `/payments/create-order` | POST | Create Razorpay order |
| Wallet | `/wallet/balance` | GET | Get wallet balance |

## Deployment

### Backend (Vercel)
```bash
cd backend
vercel --prod
```

### Mobile App
```bash
cd mobile
flutter build apk --release
flutter build appbundle --release
```

### Dashboard
```bash
cd dashboard
flutter build web --release
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Backend: ESLint + Prettier
- Flutter: `dart analyze` + `dart format`
- Conventional commits required
- Test coverage minimum 80%

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions:
- Create a GitHub Issue
- Email: support@pharmaworld.com
- Documentation: [docs/](docs/)

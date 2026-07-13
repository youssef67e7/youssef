# Environment Variables Guide

Complete guide to all environment variables for the PharmaWorld ecosystem.

## Root Level

```bash
# Copy this file to .env and fill in values
cp .env.example .env
```

## Backend Environment Variables

### Server

| Variable | Type | Default | Description | Required |
|----------|------|---------|-------------|----------|
| `NODE_ENV` | string | `development` | Environment mode | Yes |
| `PORT` | number | `3000` | Server port | No |
| `API_PREFIX` | string | `api/v1` | API route prefix | No |
| `CORS_ORIGINS` | string | - | Comma-separated allowed origins | Yes |

### MongoDB

| Variable | Type | Default | Description | Required |
|----------|------|---------|-------------|----------|
| `MONGODB_URI` | string | - | MongoDB connection string | Yes |
| `MONGODB_DB_NAME` | string | `clinicDB` | Database name | No |

**Examples:**
```bash
# Atlas (Production)
MONGODB_URI=mongodb+srv://Vercel-Admin-clinicDB:jVB1Dk0hkKGmB9Wj@clinicdb.0qyfdxo.mongodb.net/clinicDB?appName=Cluster0&retryWrites=true&w=majority

# Docker (Local Development)
MONGODB_URI=mongodb://admin:password@mongodb:27017/clinicDB?authSource=admin
```

### Redis

| Variable | Type | Default | Description | Required |
|----------|------|---------|-------------|----------|
| `REDIS_HOST` | string | `localhost` | Redis host | Yes |
| `REDIS_PORT` | number | `6379` | Redis port | No |
| `REDIS_PASSWORD` | string | - | Redis password | If auth |
| `REDIS_TLS` | boolean | `false` | Enable TLS | No |

**Examples:**
```bash
# Local
REDIS_HOST=localhost
REDIS_PORT=6379

# Upstash
REDIS_HOST=us1-cool-unicorn.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AXxxxx...
REDIS_TLS=true

# Redis Cloud
REDIS_HOST=redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=xxxxx
```

### JWT Authentication

| Variable | Type | Default | Description | Required |
|----------|------|---------|-------------|----------|
| `JWT_SECRET` | string | - | JWT signing secret (min 32 chars) | Yes |
| `JWT_EXPIRATION` | string | `7d` | Access token expiration | No |
| `JWT_REFRESH_EXPIRATION` | string | `30d` | Refresh token expiration | No |
| `JWT_ISSUER` | string | `pharmaworld` | JWT issuer claim | No |

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Firebase Admin SDK

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `FIREBASE_PROJECT_ID` | string | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | string | Private key (with newlines) | Yes |
| `FIREBASE_CLIENT_EMAIL` | string | Service account email | Yes |

**Setup:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Extract values from JSON file

```bash
FIREBASE_PROJECT_ID=pharmaworld-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pharmaworld-prod.iam.gserviceaccount.com
```

### Razorpay Payments

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `RAZORPAY_KEY_ID` | string | Razorpay API key | Yes |
| `RAZORPAY_KEY_SECRET` | string | Razorpay API secret | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | string | Webhook verification secret | No |

**Environment-specific:**
```bash
# Test
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Production
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### Cloudinary (Image Storage)

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `CLOUDINARY_CLOUD_NAME` | string | Cloud name | Yes |
| `CLOUDINARY_API_KEY` | string | API key | Yes |
| `CLOUDINARY_API_SECRET` | string | API secret | Yes |

### AWS S3 (File Storage)

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `AWS_S3_BUCKET` | string | S3 bucket name | If using S3 |
| `AWS_ACCESS_KEY_ID` | string | AWS access key | If using S3 |
| `AWS_SECRET_ACCESS_KEY` | string | AWS secret key | If using S3 |
| `AWS_REGION` | string | AWS region | If using S3 |

### SMTP (Email)

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `SMTP_HOST` | string | SMTP server host | No |
| `SMTP_PORT` | number | SMTP server port | No |
| `SMTP_USER` | string | SMTP username | No |
| `SMTP_PASS` | string | SMTP password | No |
| `SMTP_FROM` | string | Sender email address | No |

```bash
# Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx
```

### Rate Limiting

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RATE_LIMIT_TTL` | number | `60` | Time window in seconds |
| `RATE_LIMIT_MAX` | number | `100` | Max requests per window |

### Delivery

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DEFAULT_DELIVERY_CHARGE` | number | `0` | Default delivery fee |
| `FREE_DELIVERY_MIN_ORDER` | number | `200` | Min order for free delivery |
| `MAX_DELIVERY_DISTANCE` | number | `15` | Max delivery distance in km |

### Loyalty & Referral

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOYALTY_POINTS_PER_RUPEE` | number | `0.1` | Points earned per ₹1 spent |
| `REFERRAL_BONUS` | number | `100` | Points for referrer |
| `REFEREE_BONUS` | number | `50` | Points for new user |

---

## Flutter App Environment

### Mobile App

Create environment config in `lib/core/config/env.dart`:

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

  static const String razorpayKey = String.fromEnvironment(
    'RAZORPAY_KEY',
    defaultValue: '',
  );

  static const String environment = String.fromEnvironment(
    'ENV',
    defaultValue: 'development',
  );
}
```

### Build Commands with Environment

```bash
# Development
flutter run --dart-define=API_URL=http://localhost:3000/api/v1

# Staging
flutter run \
  --dart-define=API_URL=https://staging-api.pharmaworld.com/api/v1 \
  --dart-define=RAZORPAY_KEY=rzp_test_xxxxx \
  --dart-define=ENV=staging

# Production
flutter run \
  --dart-define=API_URL=https://pharmaworld-api.vercel.app/api/v1 \
  --dart-define=RAZORPAY_KEY=rzp_live_xxxxx \
  --dart-define=ENV=production
```

### Dashboard App

Same environment variables as mobile, configured via `--dart-define`:

```bash
flutter build web \
  --dart-define=API_URL=https://pharmaworld-api.vercel.app/api/v1 \
  --dart-define=ENV=production
```

---

## Environment Files Structure

```
pharmaworld/
├── .env.example                 # Root env example
├── .env                         # Root env (gitignored)
├── backend/
│   ├── .env.example             # Backend env example
│   ├── .env                     # Local backend env
│   ├── .env.staging            # Staging env
│   └── .env.production.example  # Production env template
├── mobile/
│   └── lib/core/config/env.dart # Flutter env config
├── dashboard/
│   └── lib/core/config/env.dart
├── driver_app/
│   └── lib/core/config/env.dart
└── super_admin/
    └── lib/core/config/env.dart
```

---

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use different secrets** for development, staging, and production
3. **Rotate JWT secrets** periodically
4. **Use strong passwords** (minimum 16 characters)
5. **Enable 2FA** on all service accounts (MongoDB Atlas, Cloudinary, Razorpay)
6. **Use environment-specific keys** for Razorpay (test vs live)
7. **Store production secrets** in Vercel Environment Variables, not in files
8. **Restrict CORS origins** in production
9. **Use connection strings** with authentication for MongoDB and Redis
10. **Monitor** for unauthorized access attempts

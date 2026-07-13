# PharmaWorld Deployment Guide

Step-by-step guide for deploying all components of the PharmaWorld ecosystem.

## Prerequisites

- GitHub account with repository access
- Vercel account (backend deployment)
- Firebase project (dashboard + super admin hosting, push notifications)
- MongoDB Atlas account (database)
- Razorpay account (payments)
- Cloudinary account (image storage)
- Google Cloud project (maps)
- Node.js 20+ installed locally
- Flutter 3.22+ installed locally

---

## 1. MongoDB Atlas Setup

### Create Cluster

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier M0 available)
3. Choose a region close to your users

### Configure Database Access

1. Go to **Database Access** → **Add New Database User**
2. Create a user with password authentication
3. Grant `readWrite` access to the `pharmaworld` database

### Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. Add `0.0.0.0/0` for Vercel (or specific IPs for security)
3. Add your local IP for development

### Get Connection String

1. Go to **Database** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password

```
mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/pharmaworld?retryWrites=true&w=majority
```

### Initialize Collections

Create initial collections and indexes:

```javascript
// Connect via MongoDB Compass or Atlas CLI
use pharmaworld

db.createCollection('users')
db.createCollection('medicines')
db.createCollection('categories')
db.createCollection('brands')
db.createCollection('carts')
db.createCollection('orders')
db.createCollection('payments')
db.createCollection('wallets')
db.createCollection('wallet_transactions')
db.createCollection('coupons')
db.createCollection('reviews')
db.createCollection('notifications')
db.createCollection('addresses')
db.createCollection('deliveries')
db.createCollection('audit_logs')
db.createCollection('settings')
db.createCollection('banners')
db.createCollection('offers')
db.createCollection('support_tickets')
db.createCollection('returns')
db.createCollection('referrals')
```

---

## 2. Firebase Project Setup

### Create Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project**
3. Name it `pharmaworld-prod`
4. Enable Google Analytics (optional)

### Enable Cloud Messaging

1. Go to **Project Settings** → **Cloud Messaging**
2. Ensure Firebase Cloud Messaging API (V1) is enabled

### Generate Service Account Key

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save the JSON file securely
4. Extract these values for environment variables:
   - `project_id`
   - `private_key`
   - `client_email`

### Setup Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

2. Initialize Firebase in your project:
```bash
firebase init hosting
```

3. Configure `firebase.json`:
```json
{
  "hosting": {
    "dashboard": {
      "public": "dashboard/build/web",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ],
      "headers": [
        {
          "source": "**/*.@(js|css)",
          "headers": [
            { "key": "Cache-Control", "value": "public, max-age=31536000" }
          ]
        }
      ]
    },
    "superadmin": {
      "public": "super_admin/build/web",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    }
  }
}
```

4. Deploy hosting:
```bash
firebase deploy --only hosting:dashboard
firebase deploy --only hosting:superadmin
```

### Setup Firebase for Flutter

```bash
cd mobile
flutterfire configure
```

This generates `lib/firebase_options.dart` with platform-specific configs.

---

## 3. Backend Deployment (Vercel)

### Option A: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy from backend directory:
```bash
cd backend
vercel
```

4. Deploy to production:
```bash
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Configure Environment Variables on Vercel

Go to **Project Settings** → **Environment Variables** and add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
REDIS_HOST=us1-cool-unicorn.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AXxxxx
REDIS_TLS=true
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRATION=7d
FIREBASE_PROJECT_ID=pharmaworld-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pharmaworld-prod.iam.gserviceaccount.com
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
CORS_ORIGINS=https://dashboard.pharmaworld.com,https://superadmin.pharmaworld.com
```

### Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add `api.pharmaworld.com`
3. Configure DNS:
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

### Verify Deployment

```bash
curl https://api.pharmaworld.com/health
```

Expected response:
```json
{
  "status": "ok",
  "database": { "status": "connected" },
  "redis": { "status": "connected" },
  "version": "1.0.0"
}
```

---

## 4. Flutter Apps Build & Deploy

### Mobile App (Android)

#### Build APK
```bash
cd mobile
flutter pub get
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

#### Build App Bundle (Play Store)
```bash
flutter build appbundle --release
```

Output: `build/app/outputs/bundle/release/app-release.aab`

#### Sign APK/App Bundle

1. Create keystore:
```bash
keytool -genkey -v -keystore ~/pharmaworld-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias pharmaworld
```

2. Create `android/key.properties`:
```properties
storePassword=<password>
keyPassword=<password>
keyAlias=pharmaworld
storeFile=<path-to-keystore>
```

3. Configure `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        keyAlias pharmaworld
        storeFile file('<path-to-keystore>')
        storePassword '<password>'
        keyPassword '<password>'
    }
}
```

#### Publish to Play Store

1. Create a Play Console account
2. Create a new app
3. Upload AAB file
4. Fill in store listing, content rating, pricing
5. Submit for review

### Mobile App (iOS)

```bash
cd mobile
flutter build ios --release
```

1. Open `ios/Runner.xcworkspace` in Xcode
2. Configure signing & provisioning
3. Archive and upload to App Store Connect

### Dashboard (Flutter Web)

```bash
cd dashboard
flutter pub get
flutter build web --release --base-href /
```

Output: `build/web/`

Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting:dashboard
```

### Super Admin (Flutter Web)

```bash
cd super_admin
flutter pub get
flutter build web --release --base-href /
```

Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting:superadmin
```

### Driver App (Android)

```bash
cd driver_app
flutter pub get
flutter build apk --release
```

---

## 5. CI/CD Setup

### GitHub Secrets

Go to **Repository** → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `FIREBASE_TOKEN` | Firebase CI token |
| `SONAR_TOKEN` | SonarCloud token (optional) |

### Generate Firebase CI Token

```bash
firebase login:ci
# Copy the token from the URL
```

### GitHub Actions Workflow

Workflows are configured in `.github/workflows/`:

- `backend-ci.yml` - Backend lint, test, build, deploy
- `mobile-ci.yml` - Mobile app analyze, test, build
- `dashboard-ci.yml` - Dashboard build & deploy

### Branch Strategy

```
main          → Production deployment
  └── develop → Staging deployment
       └── feature/* → Pull request (CI runs)
```

---

## 6. Post-Deployment Checklist

### Backend
- [ ] Health endpoint responds `200 OK`
- [ ] Register a test user
- [ ] Login and receive JWT
- [ ] Create a test medicine
- [ ] Place a test order
- [ ] Process a test payment (Razorpay test mode)
- [ ] Verify email notifications
- [ ] Check audit logs

### Mobile
- [ ] App installs on Android/iOS
- [ ] Login/Register works
- [ ] Medicine browsing works
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] Payment processing works
- [ ] Push notifications received
- [ ] Map/delivery tracking works

### Dashboard
- [ ] Web app loads in browser
- [ ] Admin login works
- [ ] Medicine management works
- [ ] Order management works
- [ ] Analytics dashboard loads
- [ ] Reports can be generated

### Infrastructure
- [ ] MongoDB Atlas backups enabled
- [ ] Redis persistence enabled
- [ ] Firebase FCM configured
- [ ] Cloudinary upload limits set
- [ ] Rate limiting active
- [ ] CORS configured properly
- [ ] SSL/TLS enabled on all domains
- [ ] Error monitoring set up

---

## 7. Monitoring & Maintenance

### Uptime Monitoring

Use a service like UptimeRobot or BetterStack:
- Monitor `https://api.pharmaworld.com/health`
- Alert on downtime

### Log Monitoring

- Vercel: Function logs in dashboard
- MongoDB: Atlas monitoring
- Errors: Sentry integration (recommended)

### Database Backups

- MongoDB Atlas: Enable continuous backups
- Schedule periodic exports:
```bash
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)
```

### Performance Optimization

1. **Redis caching** for frequently accessed data
2. **MongoDB indexes** on queried fields
3. **Image optimization** via Cloudinary transforms
4. **CDN** for static assets
5. **Gzip compression** enabled in Vercel

### Scaling

- **Vercel:** Auto-scales serverless functions
- **MongoDB Atlas:** Upgrade cluster tier as needed
- **Redis:** Upgrade plan for more memory
- **Cloudinary:** Bandwidth plans scale automatically

---

## 8. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` MongoDB | Check IP whitelist in Atlas |
| `JWT verification failed` | Ensure same secret in all environments |
| `CORS error` | Add frontend URL to `CORS_ORIGINS` |
| `Rate limited` | Increase limits or wait for window reset |
| `Build fails` | Check Node.js/Flutter version compatibility |
| `Vercel 502` | Check function timeout (max 10s on hobby) |
| `Firebase deploy fails` | Run `firebase login:ci` and update token |

### Health Check

```bash
# Backend
curl https://api.pharmaworld.com/health

# Dashboard
curl -I https://pharmaworld.com

# Super Admin
curl -I https://admin.pharmaworld.com
```

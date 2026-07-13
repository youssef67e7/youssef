export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  appName: process.env.APP_NAME || 'PharmaWorld',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@pharmaworld.com',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  paymob: {
    apiKey: process.env.PAYMOB_API_KEY || '',
    hmacKey: process.env.PAYMOB_HMAC_KEY || '',
  },
  fawry: {
    merchantId: process.env.FAWRY_MERCHANT_ID || '',
    securityKey: process.env.FAWRY_SECURITY_KEY || '',
  },
};

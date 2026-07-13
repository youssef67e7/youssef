import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { LoyaltyPointsModule } from './modules/loyalty-points/loyalty-points.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OffersModule } from './modules/offers/offers.module';
import { BannersModule } from './modules/banners/banners.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { SupportModule } from './modules/support/support.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { AddressModule } from './modules/address/address.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { UploadModule } from './modules/upload/upload.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
            }),
          ),
        }),
      ],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-clinicDB:jVB1Dk0hkKGmB9Wj@clinicdb.0qyfdxo.mongodb.net/clinicDB?appName=Cluster0&retryWrites=true&w=majority'),
    AuthModule,
    UsersModule,
    MedicinesModule,
    CategoriesModule,
    BrandsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    DeliveryModule,
    CouponsModule,
    WalletModule,
    LoyaltyPointsModule,
    ReviewsModule,
    NotificationsModule,
    OffersModule,
    BannersModule,
    ReferralsModule,
    SupportModule,
    ReturnsModule,
    AddressModule,
    SearchModule,
    AnalyticsModule,
    ReportsModule,
    AuditLogModule,
    SystemSettingsModule,
    UploadModule,
    HealthModule,
  ],
})
class DevAppModule {}

async function bootstrap() {
  console.log('Starting MongoDB Memory Server...');

  const mongod = await MongoMemoryServer.create({
    instance: { dbName: 'clinicDB' },
  });
  const uri = mongod.getUri();
  console.log(`In-memory MongoDB running at: ${uri}`);

  const app = await NestFactory.create(DevAppModule, { bufferLogs: true });

  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  app.use(helmet.default());
  app.use(compression());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('PharmaWorld API')
    .setDescription('PharmaWorld Enterprise Pharmacy Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Medicines', 'Medicine catalog')
    .addTag('Categories', 'Product categories')
    .addTag('Brands', 'Product brands')
    .addTag('Cart', 'Shopping cart')
    .addTag('Orders', 'Order management')
    .addTag('Payments', 'Payment processing')
    .addTag('Delivery', 'Delivery management')
    .addTag('Coupons', 'Coupon management')
    .addTag('Wallet', 'User wallet')
    .addTag('Loyalty Points', 'Loyalty program')
    .addTag('Reviews', 'Product reviews')
    .addTag('Notifications', 'Push notifications')
    .addTag('Offers', 'Special offers')
    .addTag('Banners', 'Homepage banners')
    .addTag('Referrals', 'Referral program')
    .addTag('Support', 'Customer support')
    .addTag('Returns', 'Returns and refunds')
    .addTag('Addresses', 'User addresses')
    .addTag('Search', 'Search functionality')
    .addTag('Analytics', 'Business analytics')
    .addTag('Reports', 'Report generation')
    .addTag('Audit Log', 'Audit trail')
    .addTag('System Settings', 'System configuration')
    .addTag('Upload', 'File uploads')
    .addTag('Health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = 3000;
  await app.listen(port);

  console.log('');
  console.log('===========================================');
  console.log('  PharmaWorld Backend is RUNNING!');
  console.log('===========================================');
  console.log(`  API:           http://localhost:${port}`);
  console.log(`  Swagger Docs:  http://localhost:${port}/docs`);
  console.log(`  Health Check:  http://localhost:${port}/api/v1/health`);
  console.log(`  MongoDB:       ${uri}`);
  console.log('===========================================');
}

bootstrap();

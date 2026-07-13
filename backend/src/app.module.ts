import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { DatabaseModule } from './database/database.module';
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
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
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
        ...(process.env.NODE_ENV === 'development'
          ? [
              new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
              }),
              new winston.transports.File({
                filename: 'logs/combined.log',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
              }),
            ]
          : []),
      ],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }
}

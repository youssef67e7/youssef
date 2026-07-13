import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const globalPrefix = process.env.API_PREFIX || 'api/v1';
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

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();

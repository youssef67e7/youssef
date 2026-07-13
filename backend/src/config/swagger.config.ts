import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('PharmaWorld API')
  .setDescription('PharmaWorld Enterprise Pharmacy Backend API Documentation')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    },
    'access-token',
  )
  .addTag('Auth', 'Authentication and authorization')
  .addTag('Users', 'User management')
  .addTag('Medicines', 'Medicine catalog management')
  .addTag('Categories', 'Category management')
  .addTag('Brands', 'Brand management')
  .addTag('Cart', 'Shopping cart operations')
  .addTag('Orders', 'Order management')
  .addTag('Payments', 'Payment processing')
  .addTag('Delivery', 'Delivery management')
  .addTag('Coupons', 'Coupon management')
  .addTag('Wallet', 'User wallet')
  .addTag('Loyalty Points', 'Loyalty program')
  .addTag('Reviews', 'Product reviews')
  .addTag('Notifications', 'Notifications')
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

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
  customSiteTitle: 'PharmaWorld API Docs',
};

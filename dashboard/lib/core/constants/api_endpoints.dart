class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String profile = '/auth/profile';
  static const String updateProfile = '/auth/profile/update';

  // Dashboard
  static const String dashboard = '/dashboard';
  static const String dashboardStats = '/dashboard/stats';
  static const String dashboardRevenue = '/dashboard/revenue';
  static const String dashboardOrders = '/dashboard/orders-chart';
  static const String dashboardTopMedicines = '/dashboard/top-medicines';
  static const String dashboardCustomerGrowth = '/dashboard/customer-growth';
  static const String dashboardInventoryAlerts = '/dashboard/inventory-alerts';
  static const String dashboardOrderStatusDistribution =
      '/dashboard/order-status-distribution';
  static const String dashboardRecentOrders = '/dashboard/recent-orders';

  // Medicines
  static const String medicines = '/medicines';
  static const String medicineSearch = '/medicines/search';
  static const String medicineBulk = '/medicines/bulk';
  static const String medicineImport = '/medicines/import';
  static const String medicineExport = '/medicines/export';

  // Categories
  static const String categories = '/categories';
  static const String categoriesTree = '/categories/tree';
  static const String categoryReorder = '/categories/reorder';

  // Brands
  static const String brands = '/brands';

  // Orders
  static const String orders = '/orders';
  static const String orderDetail = '/orders/detail';
  static const String orderStatus = '/orders/status';
  static const String orderAssignDriver = '/orders/assign-driver';
  static const String orderInvoice = '/orders/invoice';
  static const String orderDrivers = '/orders/drivers';

  // Customers
  static const String customers = '/customers';
  static const String customerDetail = '/customers/detail';
  static const String customerBlock = '/customers/block';
  static const String customerUnblock = '/customers/unblock';
  static const String customerOrders = '/customers/orders';

  // Drivers
  static const String drivers = '/drivers';
  static const String driverDetail = '/drivers/detail';
  static const String driverEarnings = '/drivers/earnings';
  static const String driverDeliveries = '/drivers/deliveries';
  static const String driverOnlineStatus = '/drivers/online-status';

  // Coupons
  static const String coupons = '/coupons';
  static const String couponStats = '/coupons/stats';

  // Offers
  static const String offers = '/offers';
  static const String offersScheduled = '/offers/scheduled';

  // Banners
  static const String banners = '/banners';
  static const String bannerReorder = '/banners/reorder';

  // Reviews
  static const String reviews = '/reviews';
  static const String reviewApprove = '/reviews/approve';
  static const String reviewReject = '/reviews/reject';
  static const String reviewReply = '/reviews/reply';

  // Notifications
  static const String notifications = '/notifications';
  static const String notificationsSend = '/notifications/send';
  static const String notificationsSendAll = '/notifications/send-all';
  static const String notificationsHistory = '/notifications/history';

  // Returns
  static const String returns = '/returns';
  static const String returnApprove = '/returns/approve';
  static const String returnReject = '/returns/reject';
  static const String returnRefund = '/returns/refund';

  // Analytics
  static const String analytics = '/analytics';
  static const String analyticsCompare = '/analytics/compare';
  static const String analyticsRevenue = '/analytics/revenue';
  static const String analyticsOrders = '/analytics/orders';
  static const String analyticsCustomers = '/analytics/customers';
  static const String analyticsExport = '/analytics/export';

  // Reports
  static const String reports = '/reports';
  static const String reportsGenerate = '/reports/generate';
  static const String reportsDownload = '/reports/download';

  // Audit Log
  static const String auditLog = '/audit-log';

  // Settings
  static const String settings = '/settings';
  static const String settingsGeneral = '/settings/general';
  static const String settingsPayment = '/settings/payment';
  static const String settingsDelivery = '/settings/delivery';
  static const String settingsFeatureFlags = '/settings/feature-flags';
  static const String settingsMaintenance = '/settings/maintenance';

  // Users
  static const String users = '/users';
  static const String userRoles = '/users/roles';
  static const String userPermissions = '/users/permissions';
}

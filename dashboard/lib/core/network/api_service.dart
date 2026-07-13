import 'package:dio/dio.dart';
import 'package:pharmaworld_dashboard/core/constants/api_endpoints.dart';

class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  // ---------------------------------------------------------------------------
  // Generic HTTP helpers
  // ---------------------------------------------------------------------------

  Future<Response> get(String path,
      {Map<String, dynamic>? queryParameters, Options? options}) async {
    return _dio.get(path, queryParameters: queryParameters, options: options);
  }

  Future<Response> post(String path,
      {dynamic data,
      Map<String, dynamic>? queryParameters,
      Options? options}) async {
    return _dio.post(path,
        data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response> put(String path,
      {dynamic data,
      Map<String, dynamic>? queryParameters,
      Options? options}) async {
    return _dio.put(path,
        data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response> patch(String path,
      {dynamic data,
      Map<String, dynamic>? queryParameters,
      Options? options}) async {
    return _dio.patch(path,
        data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response> delete(String path,
      {dynamic data,
      Map<String, dynamic>? queryParameters,
      Options? options}) async {
    return _dio.delete(path,
        data: data, queryParameters: queryParameters, options: options);
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  Future<Response> login(Map<String, dynamic> data) =>
      post(ApiEndpoints.login, data: data);

  Future<Response> logout() => post(ApiEndpoints.logout);

  Future<Response> refreshToken(String token) =>
      post(ApiEndpoints.refreshToken, data: {'refreshToken': token});

  Future<Response> me() => get(ApiEndpoints.profile);

  Future<Response> getProfile() => get(ApiEndpoints.profile);

  Future<Response> updateProfile(Map<String, dynamic> data) =>
      put(ApiEndpoints.updateProfile, data: data);

  Future<Response> forgotPassword(String email) =>
      post(ApiEndpoints.forgotPassword, data: {'email': email});

  Future<Response> resetPassword(
          {required String token, required String newPassword}) =>
      post(ApiEndpoints.resetPassword,
          data: {'token': token, 'newPassword': newPassword});

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  Future<Response> getDashboardStats() => get(ApiEndpoints.dashboardStats);

  Future<Response> getDashboardRevenue({String period = '7d'}) =>
      get(ApiEndpoints.dashboardRevenue, queryParameters: {'period': period});

  Future<Response> getDashboardOrdersChart({String period = '7d'}) =>
      get(ApiEndpoints.dashboardOrders, queryParameters: {'period': period});

  Future<Response> getTopMedicines({int limit = 10}) =>
      get(ApiEndpoints.dashboardTopMedicines, queryParameters: {'limit': limit});

  Future<Response> getDashboardOrderStatusDistribution() =>
      get(ApiEndpoints.dashboardOrderStatusDistribution);

  Future<Response> getDashboardRecentOrders({int limit = 10}) =>
      get(ApiEndpoints.dashboardRecentOrders, queryParameters: {'limit': limit});

  Future<Response> getDashboardOrders({int page = 1, int limit = 10}) =>
      get(ApiEndpoints.orders, queryParameters: {'page': page, 'limit': limit, 'sort': '-createdAt'});

  Future<Response> getCustomerGrowth({String period = '30d'}) =>
      get(ApiEndpoints.dashboardCustomerGrowth,
          queryParameters: {'period': period});

  Future<Response> getInventoryAlerts() =>
      get(ApiEndpoints.dashboardInventoryAlerts);

  // ---------------------------------------------------------------------------
  // Medicines
  // ---------------------------------------------------------------------------

  Future<Response> getMedicines({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.medicines, queryParameters: params);

  Future<Response> searchMedicines({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.medicineSearch, queryParameters: params);

  Future<Response> getMedicine(String id) =>
      get('${ApiEndpoints.medicines}/$id');

  Future<Response> createMedicine(Map<String, dynamic> data) =>
      post(ApiEndpoints.medicines, data: data);

  Future<Response> updateMedicine(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.medicines}/$id', data: data);

  Future<Response> deleteMedicine(String id) =>
      delete('${ApiEndpoints.medicines}/$id');

  Future<Response> bulkDeleteMedicines(List<String> ids) =>
      post(ApiEndpoints.medicineBulk, data: {'action': 'delete', 'ids': ids});

  Future<Response> bulkActivateMedicines(List<String> ids) => post(
      ApiEndpoints.medicineBulk,
      data: {'action': 'activate', 'ids': ids});

  Future<Response> bulkDeactivateMedicines(List<String> ids) => post(
      ApiEndpoints.medicineBulk,
      data: {'action': 'deactivate', 'ids': ids});

  Future<Response> bulkUpdateMedicines(List<String> ids, Map<String, dynamic> data) =>
      put(ApiEndpoints.medicineBulk, data: {'ids': ids, ...data});

  Future<Response> importMedicines(FormData formData) =>
      post(ApiEndpoints.medicineImport, data: formData);

  Future<Response> exportMedicines(
          {String format = 'csv', Map<String, dynamic>? filters}) =>
      get(ApiEndpoints.medicineExport,
          queryParameters: {'format': format, ...?filters});

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------

  Future<Response> getCategories({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.categories, queryParameters: params);

  Future<Response> getCategoryTree() => get(ApiEndpoints.categoriesTree);

  Future<Response> createCategory(Map<String, dynamic> data) =>
      post(ApiEndpoints.categories, data: data);

  Future<Response> updateCategory(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.categories}/$id', data: data);

  Future<Response> deleteCategory(String id) =>
      delete('${ApiEndpoints.categories}/$id');

  Future<Response> reorderCategories(List<String> ids) =>
      post(ApiEndpoints.categoryReorder, data: {'order': ids});

  // ---------------------------------------------------------------------------
  // Brands
  // ---------------------------------------------------------------------------

  Future<Response> getBrands({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.brands, queryParameters: params);

  Future<Response> createBrand(Map<String, dynamic> data) =>
      post(ApiEndpoints.brands, data: data);

  Future<Response> updateBrand(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.brands}/$id', data: data);

  Future<Response> deleteBrand(String id) =>
      delete('${ApiEndpoints.brands}/$id');

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------

  Future<Response> getOrders({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.orders, queryParameters: params);

  Future<Response> getOrder(String id) =>
      get('${ApiEndpoints.orders}/$id');

  Future<Response> updateOrderStatus(String id, String status) =>
      patch('${ApiEndpoints.orderStatus}/$id', data: {'status': status});

  Future<Response> assignDriver(String orderId, String driverId) =>
      post('${ApiEndpoints.orderAssignDriver}/$orderId',
          data: {'driverId': driverId});

  Future<Response> getOrderDrivers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.orderDrivers, queryParameters: params);

  Future<Response> getOrderInvoice(String orderId) =>
      get('${ApiEndpoints.orderInvoice}/$orderId');

  // ---------------------------------------------------------------------------
  // Customers
  // ---------------------------------------------------------------------------

  Future<Response> getCustomers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.customers, queryParameters: params);

  Future<Response> getCustomer(String id) =>
      get('${ApiEndpoints.customerDetail}/$id');

  Future<Response> blockCustomer(String id, {String? reason}) =>
      patch('${ApiEndpoints.customerBlock}/$id',
          data: reason != null ? {'reason': reason} : null);

  Future<Response> unblockCustomer(String id) =>
      patch('${ApiEndpoints.customerUnblock}/$id');

  Future<Response> toggleBlockCustomer(String id) =>
      put('${ApiEndpoints.customerBlock}/$id/toggle');

  Future<Response> getCustomerOrders(String id,
          {Map<String, dynamic>? params}) =>
      get('${ApiEndpoints.customerOrders}/$id', queryParameters: params);

  // ---------------------------------------------------------------------------
  // Drivers
  // ---------------------------------------------------------------------------

  Future<Response> getDrivers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.drivers, queryParameters: params);

  Future<Response> getDriver(String id) =>
      get('${ApiEndpoints.driverDetail}/$id');

  Future<Response> createDriver(Map<String, dynamic> data) =>
      post(ApiEndpoints.drivers, data: data);

  Future<Response> updateDriver(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.drivers}/$id', data: data);

  Future<Response> deleteDriver(String id) =>
      delete('${ApiEndpoints.drivers}/$id');

  Future<Response> getDriverEarnings(String id,
          {Map<String, dynamic>? params}) =>
      get('${ApiEndpoints.driverEarnings}/$id', queryParameters: params);

  Future<Response> getDriverDeliveries(String id,
          {Map<String, dynamic>? params}) =>
      get('${ApiEndpoints.driverDeliveries}/$id', queryParameters: params);

  Future<Response> setDriverOnlineStatus(String id, bool isOnline) =>
      patch('${ApiEndpoints.driverOnlineStatus}/$id',
          data: {'isOnline': isOnline});

  // ---------------------------------------------------------------------------
  // Coupons
  // ---------------------------------------------------------------------------

  Future<Response> getCoupons({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.coupons, queryParameters: params);

  Future<Response> getCouponStats() => get(ApiEndpoints.couponStats);

  Future<Response> createCoupon(Map<String, dynamic> data) =>
      post(ApiEndpoints.coupons, data: data);

  Future<Response> updateCoupon(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.coupons}/$id', data: data);

  Future<Response> deleteCoupon(String id) =>
      delete('${ApiEndpoints.coupons}/$id');

  Future<Response> toggleCouponActive(String id) =>
      patch('${ApiEndpoints.coupons}/$id/toggle-active');

  // ---------------------------------------------------------------------------
  // Offers
  // ---------------------------------------------------------------------------

  Future<Response> getOffers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.offers, queryParameters: params);

  Future<Response> getScheduledOffers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.offersScheduled, queryParameters: params);

  Future<Response> createOffer(Map<String, dynamic> data) =>
      post(ApiEndpoints.offers, data: data);

  Future<Response> updateOffer(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.offers}/$id', data: data);

  Future<Response> deleteOffer(String id) =>
      delete('${ApiEndpoints.offers}/$id');

  Future<Response> toggleOfferActive(String id) =>
      patch('${ApiEndpoints.offers}/$id/toggle-active');

  // ---------------------------------------------------------------------------
  // Banners
  // ---------------------------------------------------------------------------

  Future<Response> getBanners({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.banners, queryParameters: params);

  Future<Response> createBanner(Map<String, dynamic> data) =>
      post(ApiEndpoints.banners, data: data);

  Future<Response> updateBanner(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.banners}/$id', data: data);

  Future<Response> deleteBanner(String id) =>
      delete('${ApiEndpoints.banners}/$id');

  Future<Response> reorderBanners(List<String> ids) =>
      post(ApiEndpoints.bannerReorder, data: {'order': ids});

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------

  Future<Response> getReviews({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.reviews, queryParameters: params);

  Future<Response> approveReview(String id) =>
      patch('${ApiEndpoints.reviewApprove}/$id');

  Future<Response> rejectReview(String id) =>
      patch('${ApiEndpoints.reviewReject}/$id');

  Future<Response> replyToReview(String id, String reply) =>
      post('${ApiEndpoints.reviewReply}/$id', data: {'reply': reply});

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------

  Future<Response> getNotifications({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.notifications, queryParameters: params);

  Future<Response> sendNotification(Map<String, dynamic> data) =>
      post(ApiEndpoints.notificationsSend, data: data);

  Future<Response> sendNotificationToAll(Map<String, dynamic> data) =>
      post(ApiEndpoints.notificationsSendAll, data: data);

  Future<Response> deleteNotification(String id) =>
      delete('${ApiEndpoints.notifications}/$id');

  Future<Response> getNotificationHistory({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.notificationsHistory, queryParameters: params);

  // ---------------------------------------------------------------------------
  // Returns
  // ---------------------------------------------------------------------------

  Future<Response> getReturns({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.returns, queryParameters: params);

  Future<Response> approveReturn(String id) =>
      patch('${ApiEndpoints.returnApprove}/$id');

  Future<Response> rejectReturn(String id, {String? reason}) =>
      patch('${ApiEndpoints.returnReject}/$id',
          data: reason != null ? {'reason': reason} : null);

  Future<Response> processRefund(String id, Map<String, dynamic> data) =>
      post('${ApiEndpoints.returnRefund}/$id', data: data);

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------

  Future<Response> getAnalyticsDashboard({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.analytics, queryParameters: params);

  Future<Response> getAnalyticsRevenue({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.analyticsRevenue, queryParameters: params);

  Future<Response> getAnalyticsOrders({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.analyticsOrders, queryParameters: params);

  Future<Response> getAnalyticsCustomers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.analyticsCustomers, queryParameters: params);

  Future<Response> compareAnalytics(Map<String, dynamic> data) =>
      post(ApiEndpoints.analyticsCompare, data: data);

  Future<Response> exportAnalytics(
          {String format = 'csv', Map<String, dynamic>? filters}) =>
      get(ApiEndpoints.analyticsExport,
          queryParameters: {'format': format, ...?filters});

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------

  Future<Response> getReports({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.reports, queryParameters: params);

  Future<Response> generateReport(Map<String, dynamic> data) =>
      post(ApiEndpoints.reportsGenerate, data: data);

  Future<Response> downloadReport(String id, {String format = 'pdf'}) =>
      get('${ApiEndpoints.reportsDownload}/$id',
          queryParameters: {'format': format},
          options: Options(responseType: ResponseType.bytes));

  Future<Response> deleteReport(String id) =>
      delete('${ApiEndpoints.reports}/$id');

  // ---------------------------------------------------------------------------
  // Audit Log
  // ---------------------------------------------------------------------------

  Future<Response> getAuditLogs({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.auditLog, queryParameters: params);

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  Future<Response> getSettings() => get(ApiEndpoints.settings);

  Future<Response> updateSettings(Map<String, dynamic> data) =>
      put(ApiEndpoints.settings, data: data);

  Future<Response> getSettingsByName(String name) =>
      get('${ApiEndpoints.settings}/$name');

  Future<Response> getGeneralSettings() => get(ApiEndpoints.settingsGeneral);

  Future<Response> updateGeneralSettings(Map<String, dynamic> data) =>
      put(ApiEndpoints.settingsGeneral, data: data);

  Future<Response> getPaymentSettings() => get(ApiEndpoints.settingsPayment);

  Future<Response> updatePaymentSettings(Map<String, dynamic> data) =>
      put(ApiEndpoints.settingsPayment, data: data);

  Future<Response> getDeliverySettings() => get(ApiEndpoints.settingsDelivery);

  Future<Response> updateDeliverySettings(Map<String, dynamic> data) =>
      put(ApiEndpoints.settingsDelivery, data: data);

  Future<Response> toggleFeatureFlag(String flag, bool enabled) =>
      patch('${ApiEndpoints.settingsFeatureFlags}/$flag',
          data: {'enabled': enabled});

  Future<Response> toggleMaintenanceMode(bool enabled) =>
      patch(ApiEndpoints.settingsMaintenance, data: {'enabled': enabled});

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  Future<Response> getUsers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.users, queryParameters: params);

  Future<Response> createUser(Map<String, dynamic> data) =>
      post(ApiEndpoints.users, data: data);

  Future<Response> updateUser(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.users}/$id', data: data);

  Future<Response> deleteUser(String id) =>
      delete('${ApiEndpoints.users}/$id');

  Future<Response> getRoles() => get(ApiEndpoints.userRoles);

  Future<Response> getPermissions() => get(ApiEndpoints.userPermissions);
}

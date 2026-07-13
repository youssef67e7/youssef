import 'package:dio/dio.dart';
import 'package:pharmaworld_dashboard/core/constants/api_endpoints.dart';

class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  Future<Response> get(String path,
      {Map<String, dynamic>? queryParameters, Options? options}) async {
    return _dio.get(path, queryParameters: queryParameters, options: options);
  }

  Future<Response> post(String path,
      {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    return _dio.post(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response> put(String path,
      {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    return _dio.put(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response> patch(String path,
      {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    return _dio.patch(path, data: data, queryParameters: queryParameters, options: options);
  }

  Future<Response> delete(String path,
      {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    return _dio.delete(path, data: data, queryParameters: queryParameters, options: options);
  }

  // Dashboard
  Future<Response> getDashboardStats() => get(ApiEndpoints.dashboardStats);
  Future<Response> getDashboardRevenue({String period = '7d'}) =>
      get(ApiEndpoints.dashboardRevenue, queryParameters: {'period': period});
  Future<Response> getDashboardOrders({String period = '7d'}) =>
      get(ApiEndpoints.dashboardOrders, queryParameters: {'period': period});
  Future<Response> getTopMedicines({int limit = 10}) =>
      get(ApiEndpoints.dashboardTopMedicines, queryParameters: {'limit': limit});
  Future<Response> getCustomerGrowth({String period = '30d'}) =>
      get(ApiEndpoints.dashboardCustomerGrowth, queryParameters: {'period': period});
  Future<Response> getInventoryAlerts() => get(ApiEndpoints.dashboardInventoryAlerts);

  // Auth
  Future<Response> login(Map<String, dynamic> data) => post(ApiEndpoints.login, data: data);
  Future<Response> logout() => post(ApiEndpoints.logout);
  Future<Response> refreshToken(String token) =>
      post(ApiEndpoints.refreshToken, data: {'refreshToken': token});
  Future<Response> getProfile() => get(ApiEndpoints.profile);

  // Medicines
  Future<Response> getMedicines({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.medicines, queryParameters: params);
  Future<Response> getMedicine(String id) => get('${ApiEndpoints.medicines}/$id');
  Future<Response> createMedicine(Map<String, dynamic> data) =>
      post(ApiEndpoints.medicines, data: data);
  Future<Response> updateMedicine(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.medicines}/$id', data: data);
  Future<Response> deleteMedicine(String id) =>
      delete('${ApiEndpoints.medicines}/$id');
  Future<Response> bulkDeleteMedicines(List<String> ids) =>
      post(ApiEndpoints.medicineBulk, data: {'action': 'delete', 'ids': ids});
  Future<Response> bulkUpdateMedicines(List<String> ids, Map<String, dynamic> data) =>
      post(ApiEndpoints.medicineBulk, data: {'action': 'update', 'ids': ids, ...data});
  Future<Response> exportMedicines({String format = 'csv', Map<String, dynamic>? filters}) =>
      get(ApiEndpoints.medicineExport, queryParameters: {'format': format, ...?filters});

  // Categories
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

  // Brands
  Future<Response> getBrands({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.brands, queryParameters: params);
  Future<Response> createBrand(Map<String, dynamic> data) =>
      post(ApiEndpoints.brands, data: data);
  Future<Response> updateBrand(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.brands}/$id', data: data);
  Future<Response> deleteBrand(String id) =>
      delete('${ApiEndpoints.brands}/$id');

  // Orders
  Future<Response> getOrders({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.orders, queryParameters: params);
  Future<Response> getOrder(String id) => get('${ApiEndpoints.orders}/$id');
  Future<Response> updateOrderStatus(String id, String status) =>
      patch('${ApiEndpoints.orderStatus}/$id', data: {'status': status});
  Future<Response> assignDriver(String orderId, String driverId) =>
      post('${ApiEndpoints.orderAssignDriver}/$orderId', data: {'driverId': driverId});

  // Customers
  Future<Response> getCustomers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.customers, queryParameters: params);
  Future<Response> getCustomer(String id) => get('${ApiEndpoints.customerDetail}/$id');
  Future<Response> toggleBlockCustomer(String id) =>
      patch('${ApiEndpoints.customerBlock}/$id');

  // Drivers
  Future<Response> getDrivers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.drivers, queryParameters: params);
  Future<Response> getDriver(String id) => get('${ApiEndpoints.driverDetail}/$id');
  Future<Response> getDriverEarnings(String id, {Map<String, dynamic>? params}) =>
      get('${ApiEndpoints.driverEarnings}/$id', queryParameters: params);
  Future<Response> getDriverDeliveries(String id, {Map<String, dynamic>? params}) =>
      get('${ApiEndpoints.driverDeliveries}/$id', queryParameters: params);

  // Coupons
  Future<Response> getCoupons({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.coupons, queryParameters: params);
  Future<Response> createCoupon(Map<String, dynamic> data) =>
      post(ApiEndpoints.coupons, data: data);
  Future<Response> updateCoupon(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.coupons}/$id', data: data);
  Future<Response> deleteCoupon(String id) =>
      delete('${ApiEndpoints.coupons}/$id');

  // Offers
  Future<Response> getOffers({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.offers, queryParameters: params);
  Future<Response> createOffer(Map<String, dynamic> data) =>
      post(ApiEndpoints.offers, data: data);
  Future<Response> updateOffer(String id, Map<String, dynamic> data) =>
      put('${ApiEndpoints.offers}/$id', data: data);
  Future<Response> deleteOffer(String id) =>
      delete('${ApiEndpoints.offers}/$id');

  // Banners
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

  // Reviews
  Future<Response> getReviews({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.reviews, queryParameters: params);
  Future<Response> approveReview(String id) =>
      patch('${ApiEndpoints.reviewApprove}/$id');
  Future<Response> rejectReview(String id) =>
      patch('${ApiEndpoints.reviewReject}/$id');
  Future<Response> replyToReview(String id, String reply) =>
      post('${ApiEndpoints.reviewReply}/$id', data: {'reply': reply});

  // Notifications
  Future<Response> getNotifications({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.notifications, queryParameters: params);
  Future<Response> sendNotification(Map<String, dynamic> data) =>
      post(ApiEndpoints.notificationsSend, data: data);
  Future<Response> getNotificationHistory({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.notificationsHistory, queryParameters: params);

  // Returns
  Future<Response> getReturns({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.returns, queryParameters: params);
  Future<Response> approveReturn(String id) =>
      patch('${ApiEndpoints.returnApprove}/$id');
  Future<Response> rejectReturn(String id, {String? reason}) =>
      patch('${ApiEndpoints.returnReject}/$id', data: {'reason': reason});
  Future<Response> processRefund(String id, Map<String, dynamic> data) =>
      post('${ApiEndpoints.returnRefund}/$id', data: data);

  // Analytics
  Future<Response> getAnalytics({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.analytics, queryParameters: params);
  Future<Response> compareAnalytics(Map<String, dynamic> data) =>
      post(ApiEndpoints.analyticsCompare, data: data);

  // Reports
  Future<Response> generateReport(Map<String, dynamic> data) =>
      post(ApiEndpoints.reportsGenerate, data: data);

  // Audit Log
  Future<Response> getAuditLogs({Map<String, dynamic>? params}) =>
      get(ApiEndpoints.auditLog, queryParameters: params);

  // Settings
  Future<Response> getSettings() => get(ApiEndpoints.settings);
  Future<Response> updateSettings(Map<String, dynamic> data) =>
      put(ApiEndpoints.settings, data: data);
  Future<Response> toggleFeatureFlag(String flag, bool enabled) =>
      patch('${ApiEndpoints.settingsFeatureFlags}/$flag', data: {'enabled': enabled});
  Future<Response> toggleMaintenanceMode(bool enabled) =>
      patch(ApiEndpoints.settingsMaintenance, data: {'enabled': enabled});

  // Users
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

import 'package:dio/dio.dart';
import 'dio_client.dart';
import '../constants/api.dart';

class ApiService {
  final DioClient _client;

  ApiService(this._client);

  Dio get _dio => _client.dio;

  // Auth
  Future<Response> login(String email, String password) =>
      _dio.post(ApiConstants.login, data: {'email': email, 'password': password});

  Future<Response> verifyMfa(String code, String sessionToken) =>
      _dio.post(ApiConstants.verifyMfa, data: {'code': code, 'sessionToken': sessionToken});

  Future<Response> logout() => _dio.post(ApiConstants.logout);
  Future<Response> getProfile() => _dio.get(ApiConstants.profile);

  // Dashboard
  Future<Response> getDashboardStats() => _dio.get(ApiConstants.dashboardStats);
  Future<Response> getDashboardRevenue(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.dashboardRevenue, queryParameters: params);
  Future<Response> getDashboardOrders(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.dashboardOrders, queryParameters: params);
  Future<Response> getDashboardSystemHealth() => _dio.get(ApiConstants.dashboardSystemHealth);
  Future<Response> getAlerts() => _dio.get(ApiConstants.dashboardAlerts);

  // Pharmacies
  Future<Response> getPharmacies(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.pharmacies, queryParameters: params);
  Future<Response> getPharmacy(String id) => _dio.get(ApiConstants.pharmacyById(id));
  Future<Response> getPharmacyMetrics(String id) => _dio.get(ApiConstants.pharmacyMetrics(id));
  Future<Response> togglePharmacy(String id) => _dio.post(ApiConstants.pharmacyToggle(id));

  // Users
  Future<Response> getUsers(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.users, queryParameters: params);
  Future<Response> getUser(String id) => _dio.get(ApiConstants.userById(id));
  Future<Response> getUserHistory(String id) => _dio.get(ApiConstants.userHistory(id));
  Future<Response> toggleUser(String id) => _dio.post(ApiConstants.userToggle(id));
  Future<Response> assignUserRole(String id, String roleId) =>
      _dio.put(ApiConstants.userRole(id), data: {'roleId': roleId});

  // Roles & Permissions
  Future<Response> getRoles() => _dio.get(ApiConstants.roles);
  Future<Response> createRole(Map<String, dynamic> data) =>
      _dio.post(ApiConstants.roles, data: data);
  Future<Response> updateRole(String id, Map<String, dynamic> data) =>
      _dio.put(ApiConstants.roleById(id), data: data);
  Future<Response> deleteRole(String id) => _dio.delete(ApiConstants.roleById(id));
  Future<Response> getPermissions() => _dio.get(ApiConstants.permissions);
  Future<Response> getPermissionMatrix() => _dio.get(ApiConstants.permissionMatrix);
  Future<Response> updatePermissionMatrix(Map<String, dynamic> data) =>
      _dio.put(ApiConstants.permissionMatrix, data: data);

  // Feature Flags
  Future<Response> getFeatureFlags() => _dio.get(ApiConstants.featureFlags);
  Future<Response> createFeatureFlag(Map<String, dynamic> data) =>
      _dio.post(ApiConstants.featureFlags, data: data);
  Future<Response> updateFeatureFlag(String id, Map<String, dynamic> data) =>
      _dio.put(ApiConstants.featureFlagById(id), data: data);
  Future<Response> toggleFeatureFlag(String id) =>
      _dio.post(ApiConstants.featureFlagToggle(id));
  Future<Response> deleteFeatureFlag(String id) =>
      _dio.delete(ApiConstants.featureFlagById(id));

  // Maintenance
  Future<Response> getMaintenanceStatus() => _dio.get(ApiConstants.maintenanceMode);
  Future<Response> toggleMaintenance() => _dio.post(ApiConstants.maintenanceToggle);
  Future<Response> scheduleMaintenance(Map<String, dynamic> data) =>
      _dio.post(ApiConstants.maintenanceSchedule, data: data);

  // Config
  Future<Response> getConfig(String section) =>
      _dio.get(ApiConstants.configSection(section));
  Future<Response> getAllConfig() => _dio.get(ApiConstants.config);
  Future<Response> updateConfig(String section, Map<String, dynamic> data) =>
      _dio.put(ApiConstants.configSection(section), data: data);

  // Audit Logs
  Future<Response> getAuditLogs(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.auditLogs, queryParameters: params);
  Future<Response> exportAuditLogs(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.auditLogsExport, queryParameters: params);

  // Analytics
  Future<Response> getCrossBranchAnalytics(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.analyticsCrossBranch, queryParameters: params);
  Future<Response> getRevenueAnalytics(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.analyticsRevenue, queryParameters: params);
  Future<Response> getUserAnalytics(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.analyticsUsers, queryParameters: params);
  Future<Response> getGeographicAnalytics(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.analyticsGeographic, queryParameters: params);

  // Reports
  Future<Response> getReports() => _dio.get(ApiConstants.reports);
  Future<Response> generateReport(Map<String, dynamic> data) =>
      _dio.post(ApiConstants.reportsGenerate, data: data);
  Future<Response> exportReport(String reportId, String format) =>
      _dio.get('${ApiConstants.reportsExport}/$reportId', queryParameters: {'format': format});

  // System Health
  Future<Response> getSystemHealth() => _dio.get(ApiConstants.systemHealth);
  Future<Response> getApiHealth() => _dio.get(ApiConstants.systemHealthApi);
  Future<Response> getDatabaseHealth() => _dio.get(ApiConstants.systemHealthDatabase);
  Future<Response> getCacheHealth() => _dio.get(ApiConstants.systemHealthCache);
  Future<Response> getActiveSessions() => _dio.get(ApiConstants.systemHealthSessions);

  // Billing
  Future<Response> getBilling(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.billing, queryParameters: params);
  Future<Response> getBillingSummary() => _dio.get(ApiConstants.billingSummary);
  Future<Response> getInvoices(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.billingInvoices, queryParameters: params);
  Future<Response> getPayments(Map<String, dynamic> params) =>
      _dio.get(ApiConstants.billingPayments, queryParameters: params);

  // Subscriptions
  Future<Response> getSubscriptions() => _dio.get(ApiConstants.subscriptions);
  Future<Response> getSubscription(String id) =>
      _dio.get(ApiConstants.subscriptionById(id));
  Future<Response> createSubscription(Map<String, dynamic> data) =>
      _dio.post(ApiConstants.subscriptions, data: data);
  Future<Response> updateSubscription(String id, Map<String, dynamic> data) =>
      _dio.put(ApiConstants.subscriptionById(id), data: data);
  Future<Response> cancelSubscription(String id) =>
      _dio.post(ApiConstants.subscriptionCancel(id));

  // Integrations
  Future<Response> getIntegrations() => _dio.get(ApiConstants.integrations);
  Future<Response> getIntegration(String id) =>
      _dio.get(ApiConstants.integrationById(id));
  Future<Response> createIntegration(Map<String, dynamic> data) =>
      _dio.post(ApiConstants.integrations, data: data);
  Future<Response> updateIntegration(String id, Map<String, dynamic> data) =>
      _dio.put(ApiConstants.integrationById(id), data: data);
  Future<Response> toggleIntegration(String id) =>
      _dio.post(ApiConstants.integrationToggle(id));
  Future<Response> deleteIntegration(String id) =>
      _dio.delete(ApiConstants.integrationById(id));
  Future<Response> syncIntegration(String id) =>
      _dio.post(ApiConstants.integrationSync(id));
}

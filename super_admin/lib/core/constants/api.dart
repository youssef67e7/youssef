class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'https://api.pharmaworld.com';
  static const String apiVersion = '/v1';
  static const String superAdmin = '$apiVersion/super-admin';

  static const String login = '$superAdmin/auth/login';
  static const String verifyMfa = '$superAdmin/auth/verify-mfa';
  static const String logout = '$superAdmin/auth/logout';
  static const String profile = '$superAdmin/auth/profile';

  static const String dashboard = '$superAdmin/dashboard';
  static const String dashboardStats = '$dashboard/stats';
  static const String dashboardRevenue = '$dashboard/revenue';
  static const String dashboardOrders = '$dashboard/orders';
  static const String dashboardUsers = '$dashboard/users';
  static const String dashboardSystemHealth = '$dashboard/system-health';
  static const String dashboardAlerts = '$dashboard/alerts';

  static const String pharmacies = '$superAdmin/pharmacies';
  static String pharmacyById(String id) => '$pharmacies/$id';
  static String pharmacyMetrics(String id) => '$pharmacies/$id/metrics';
  static String pharmacyToggle(String id) => '$pharmacies/$id/toggle';

  static const String users = '$superAdmin/users';
  static String userById(String id) => '$users/$id';
  static String userHistory(String id) => '$users/$id/history';
  static String userToggle(String id) => '$users/$id/toggle';
  static String userRole(String id) => '$users/$id/role';

  static const String roles = '$superAdmin/roles';
  static String roleById(String id) => '$roles/$id';
  static const String permissions = '$superAdmin/permissions';
  static const String permissionMatrix = '$roles/permission-matrix';

  static const String featureFlags = '$superAdmin/feature-flags';
  static String featureFlagById(String id) => '$featureFlags/$id';
  static String featureFlagToggle(String id) => '$featureFlags/$id/toggle';

  static const String maintenanceMode = '$superAdmin/maintenance';
  static const String maintenanceToggle = '$maintenanceMode/toggle';
  static const String maintenanceSchedule = '$maintenanceMode/schedule';

  static const String config = '$superAdmin/config';
  static String configSection(String section) => '$config/$section';

  static const String auditLogs = '$superAdmin/audit-logs';
  static const String auditLogsExport = '$auditLogs/export';

  static const String analytics = '$superAdmin/analytics';
  static const String analyticsCrossBranch = '$analytics/cross-branch';
  static const String analyticsRevenue = '$analytics/revenue';
  static const String analyticsUsers = '$analytics/users';
  static const String analyticsGeographic = '$analytics/geographic';

  static const String reports = '$superAdmin/reports';
  static const String reportsGenerate = '$reports/generate';
  static const String reportsExport = '$reports/export';

  static const String systemHealth = '$superAdmin/system-health';
  static const String systemHealthApi = '$systemHealth/api';
  static const String systemHealthDatabase = '$systemHealth/database';
  static const String systemHealthCache = '$systemHealth/cache';
  static const String systemHealthSessions = '$systemHealth/sessions';
}

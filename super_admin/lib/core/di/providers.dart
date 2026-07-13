import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/dio_client.dart';
import '../network/api_service.dart';
import '../constants/storage.dart';
import '../../shared/models/dashboard_stats.dart';
import '../../shared/models/branch.dart';
import '../../shared/models/user.dart';
import '../../shared/models/role.dart';
import '../../shared/models/permission.dart';
import '../../shared/models/feature_flag.dart';
import '../../shared/models/audit_log.dart';
import '../../shared/models/system_health.dart';
import '../../features/config/presentation/pages/config_page.dart';

// ── Core Infrastructure ──────────────────────────────────────────────────────

final dioClientProvider = Provider<DioClient>((ref) => DioClient());

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(ref.read(dioClientProvider));
});

Future<void> initProviders() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString(StorageKeys.token);
  if (token != null) {
    final dioClient = DioClient();
    await dioClient.setToken(token);
  }
}

// ── Dashboard ────────────────────────────────────────────────────────────────

final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getDashboardStats();
  return DashboardStats.fromJson(response.data['data']);
});

final dashboardRevenueProvider = FutureProvider.family<List<Map<String, dynamic>>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getDashboardRevenue(params);
  return List<Map<String, dynamic>>.from(response.data['data']);
});

final dashboardOrdersProvider = FutureProvider.family<List<Map<String, dynamic>>, Map<String, dynamic>>((ref, params) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getDashboardOrders(params);
  return List<Map<String, dynamic>>.from(response.data['data']);
});

final dashboardAlertsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getAlerts();
  return List<Map<String, dynamic>>.from(response.data['data']);
});

// ── Pharmacies ───────────────────────────────────────────────────────────────

final pharmaciesProvider = FutureProvider<List<Branch>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getPharmacies({});
  final data = response.data['data'];
  final items = data is List ? data : (data['pharmacies'] ?? data['items'] ?? []);
  return List<Branch>.from(items.map((e) => Branch.fromJson(e)));
});

final pharmacyDetailProvider = FutureProvider.family<Branch, String>((ref, id) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getPharmacy(id);
  return Branch.fromJson(response.data['data']);
});

final pharmacyMetricsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getPharmacyMetrics(id);
  return Map<String, dynamic>.from(response.data['data']);
});

// ── Users ────────────────────────────────────────────────────────────────────

final usersProvider = FutureProvider<List<AppUser>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getUsers({});
  final data = response.data['data'];
  final items = data is List ? data : (data['users'] ?? data['items'] ?? []);
  return List<AppUser>.from(items.map((e) => AppUser.fromJson(e)));
});

final userDetailProvider = FutureProvider.family<AppUser, String>((ref, id) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getUser(id);
  return AppUser.fromJson(response.data['data']);
});

final userHistoryProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, id) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getUserHistory(id);
  return List<Map<String, dynamic>>.from(response.data['data']);
});

// ── Roles & Permissions ──────────────────────────────────────────────────────

final rolesProvider = StateNotifierProvider<RolesNotifier, AsyncValue<List<Role>>>((ref) {
  return RolesNotifier(ref.read(apiServiceProvider))..load();
});

class RolesNotifier extends StateNotifier<AsyncValue<List<Role>>> {
  final ApiService _api;

  RolesNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getRoles();
      final data = response.data['data'];
      final items = data is List ? data : (data['roles'] ?? data['items'] ?? []);
      state = AsyncValue.data(List<Role>.from(items.map((e) => Role.fromJson(e))));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addRole(Map<String, dynamic> data) async {
    await _api.createRole(data);
    await load();
  }

  Future<void> updateRole(String id, Map<String, dynamic> data) async {
    await _api.updateRole(id, data);
    await load();
  }

  Future<void> removeRole(String id) async {
    await _api.deleteRole(id);
    await load();
  }
}

final permissionsProvider = FutureProvider<List<Permission>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getPermissions();
  final data = response.data['data'];
  final items = data is List ? data : (data['permissions'] ?? data['items'] ?? []);
  return List<Permission>.from(items.map((e) => Permission.fromJson(e)));
});

final permissionMatrixProvider = FutureProvider<Map<String, Set<String>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getPermissionMatrix();
  final raw = response.data['data'] as Map<String, dynamic>;
  return raw.map((k, v) => MapEntry(k, Set<String>.from(v)));
});

// ── Feature Flags ────────────────────────────────────────────────────────────

final featureFlagsProvider = StateNotifierProvider<FeatureFlagsNotifier, AsyncValue<List<FeatureFlag>>>((ref) {
  return FeatureFlagsNotifier(ref.read(apiServiceProvider))..load();
});

class FeatureFlagsNotifier extends StateNotifier<AsyncValue<List<FeatureFlag>>> {
  final ApiService _api;

  FeatureFlagsNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getFeatureFlags();
      final data = response.data['data'];
      final items = data is List ? data : (data['flags'] ?? data['items'] ?? []);
      state = AsyncValue.data(List<FeatureFlag>.from(items.map((e) => FeatureFlag.fromJson(e))));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> toggleFlag(String id) async {
    await _api.toggleFeatureFlag(id);
    await load();
  }

  Future<void> updateRollout(String id, int percentage) async {
    await _api.updateFeatureFlag(id, {'rolloutPercentage': percentage});
    await load();
  }

  Future<void> addFlag(Map<String, dynamic> data) async {
    await _api.createFeatureFlag(data);
    await load();
  }

  Future<void> removeFlag(String id) async {
    await _api.deleteFeatureFlag(id);
    await load();
  }
}

// ── Maintenance ──────────────────────────────────────────────────────────────

final maintenanceProvider = StateNotifierProvider<MaintenanceNotifier, AsyncValue<Map<String, dynamic>>>((ref) {
  return MaintenanceNotifier(ref.read(apiServiceProvider))..load();
});

class MaintenanceNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  final ApiService _api;

  MaintenanceNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getMaintenanceStatus();
      state = AsyncValue.data(Map<String, dynamic>.from(response.data['data']));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> toggle() async {
    await _api.toggleMaintenance();
    await load();
  }

  Future<void> schedule(DateTime start, DateTime end) async {
    await _api.scheduleMaintenance({
      'start': start.toIso8601String(),
      'end': end.toIso8601String(),
    });
    await load();
  }
}

// ── Config ───────────────────────────────────────────────────────────────────

final selectedConfigSectionProvider = StateProvider<String>((ref) => 'environment');

final configSectionsProvider = FutureProvider<List<ConfigSection>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getAllConfig();
  final data = response.data['data'];
  final items = data is List ? data : (data['sections'] ?? data['items'] ?? []);
  return List<ConfigSection>.from(items.map((e) {
    final sectionItems = List<ConfigItem>.from(
      (e['items'] ?? []).map((i) => ConfigItem(
        key: i['key'] ?? '',
        label: i['label'] ?? '',
        value: '${i['value'] ?? ''}',
        type: i['type'] ?? 'text',
      )),
    );
    return ConfigSection(
      name: e['name'] ?? '',
      icon: e['icon'] ?? '',
      items: sectionItems,
    );
  }));
});

final configDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, section) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getConfig(section);
  return Map<String, dynamic>.from(response.data['data']);
});

// ── Audit Logs ───────────────────────────────────────────────────────────────

final auditFilterProvider = StateProvider<AuditFilter>((ref) => const AuditFilter());

class AuditFilter {
  final String? userId;
  final String? action;
  final String? entity;
  final DateTimeRange? dateRange;

  const AuditFilter({this.userId, this.action, this.entity, this.dateRange});

  AuditFilter copyWith({String? userId, String? action, String? entity, DateTimeRange? dateRange, bool clearDate = false}) {
    return AuditFilter(
      userId: userId ?? this.userId,
      action: action ?? this.action,
      entity: entity ?? this.entity,
      dateRange: clearDate ? null : (dateRange ?? this.dateRange),
    );
  }

  Map<String, dynamic> toQuery() {
    final params = <String, dynamic>{};
    if (userId != null) params['userId'] = userId;
    if (action != null) params['action'] = action;
    if (entity != null) params['entity'] = entity;
    if (dateRange != null) {
      params['startDate'] = dateRange!.start.toIso8601String();
      params['endDate'] = dateRange!.end.toIso8601String();
    }
    return params;
  }
}

final auditLogsProvider = FutureProvider<List<AuditLog>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final filter = ref.watch(auditFilterProvider);
  final response = await api.getAuditLogs(filter.toQuery());
  final data = response.data['data'];
  final items = data is List ? data : (data['logs'] ?? data['items'] ?? []);
  return List<AuditLog>.from(items.map((e) => AuditLog.fromJson(e)));
});

// ── Analytics ────────────────────────────────────────────────────────────────

final analyticsParamsProvider = StateProvider<Map<String, dynamic>>((ref) => {});

final revenueAnalyticsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final params = ref.watch(analyticsParamsProvider);
  final response = await api.getRevenueAnalytics(params);
  final data = response.data['data'];
  return List<Map<String, dynamic>>.from(data is List ? data : (data['items'] ?? []));
});

final userAnalyticsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final params = ref.watch(analyticsParamsProvider);
  final response = await api.getUserAnalytics(params);
  final data = response.data['data'];
  return List<Map<String, dynamic>>.from(data is List ? data : (data['items'] ?? []));
});

final crossBranchAnalyticsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final params = ref.watch(analyticsParamsProvider);
  final response = await api.getCrossBranchAnalytics(params);
  final data = response.data['data'];
  return List<Map<String, dynamic>>.from(data is List ? data : (data['items'] ?? []));
});

final geographicAnalyticsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final params = ref.watch(analyticsParamsProvider);
  final response = await api.getGeographicAnalytics(params);
  final data = response.data['data'];
  return List<Map<String, dynamic>>.from(data is List ? data : (data['items'] ?? []));
});

// ── Reports ──────────────────────────────────────────────────────────────────

final reportsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getReports();
  final data = response.data['data'];
  final items = data is List ? data : (data['reports'] ?? data['items'] ?? []);
  return List<Map<String, dynamic>>.from(items);
});

final reportGenerationProvider = StateNotifierProvider<ReportGenerator, AsyncValue<Map<String, dynamic>?>>((ref) {
  return ReportGenerator(ref.read(apiServiceProvider));
});

class ReportGenerator extends StateNotifier<AsyncValue<Map<String, dynamic>?>> {
  final ApiService _api;

  ReportGenerator(this._api) : super(const AsyncValue.data(null));

  Future<Map<String, dynamic>> generate(Map<String, dynamic> params) async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.generateReport(params);
      final data = Map<String, dynamic>.from(response.data['data']);
      state = AsyncValue.data(data);
      return data;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<String> export(String reportId, String format) async {
    final response = await _api.exportReport(reportId, format);
    return response.data['data']['downloadUrl'] ?? '';
  }
}

// ── System Health ────────────────────────────────────────────────────────────

final systemHealthProvider = FutureProvider<SystemHealth>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getSystemHealth();
  return SystemHealth.fromJson(response.data['data']);
});

final apiHealthProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getApiHealth();
  return Map<String, dynamic>.from(response.data['data']);
});

final databaseHealthProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getDatabaseHealth();
  return Map<String, dynamic>.from(response.data['data']);
});

final cacheHealthProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getCacheHealth();
  return Map<String, dynamic>.from(response.data['data']);
});

final activeSessionsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getActiveSessions();
  return Map<String, dynamic>.from(response.data['data']);
});

// ── Billing ──────────────────────────────────────────────────────────────────

final billingSummaryProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getBillingSummary();
  return Map<String, dynamic>.from(response.data['data']);
});

final invoicesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getInvoices({});
  final data = response.data['data'];
  final items = data is List ? data : (data['invoices'] ?? data['items'] ?? []);
  return List<Map<String, dynamic>>.from(items);
});

final paymentsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getPayments({});
  final data = response.data['data'];
  final items = data is List ? data : (data['payments'] ?? data['items'] ?? []);
  return List<Map<String, dynamic>>.from(items);
});

// ── Subscriptions ────────────────────────────────────────────────────────────

final subscriptionsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getSubscriptions();
  final data = response.data['data'];
  final items = data is List ? data : (data['subscriptions'] ?? data['items'] ?? []);
  return List<Map<String, dynamic>>.from(items);
});

// ── Integrations ─────────────────────────────────────────────────────────────

final integrationsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getIntegrations();
  final data = response.data['data'];
  final items = data is List ? data : (data['integrations'] ?? data['items'] ?? []);
  return List<Map<String, dynamic>>.from(items);
});

final integrationDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.getIntegration(id);
  return Map<String, dynamic>.from(response.data['data']);
});

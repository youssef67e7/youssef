import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final settingsProvider = FutureProvider<AppSettings>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getSettings();
  final data = response.data['data'];
  if (data is Map<String, dynamic>) {
    return AppSettings.fromJson(data);
  }
  return AppSettings();
});

class SettingsNotifier extends StateNotifier<AsyncValue<AppSettings>> {
  final dynamic _api;
  SettingsNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getSettings();
      final data = response.data['data'];
      final settings = data is Map<String, dynamic>
          ? AppSettings.fromJson(data)
          : AppSettings();
      state = AsyncValue.data(settings);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> update(Map<String, dynamic> data) async {
    await _api.updateSettings(data);
    await load();
  }

  Future<void> toggleFeatureFlag(String flag, bool enabled) async {
    await _api.toggleFeatureFlag(flag, enabled);
    await load();
  }

  Future<void> toggleMaintenanceMode(bool enabled) async {
    await _api.toggleMaintenanceMode(enabled);
    await load();
  }
}

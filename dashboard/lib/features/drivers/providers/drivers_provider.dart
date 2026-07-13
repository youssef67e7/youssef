import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final driversProvider = FutureProvider<List<Driver>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getDrivers();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Driver.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final driverSearchProvider = StateProvider<String>((ref) => '');

class DriversNotifier extends StateNotifier<AsyncValue<List<Driver>>> {
  final dynamic _api;
  DriversNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getDrivers();
      final data = response.data['data'];
      final drivers = data is List
          ? data.map((e) => Driver.fromJson(e as Map<String, dynamic>)).toList()
          : <Driver>[];
      state = AsyncValue.data(drivers);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

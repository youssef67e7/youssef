import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final brandsProvider = FutureProvider<List<Brand>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getBrands();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Brand.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

class BrandsNotifier extends StateNotifier<AsyncValue<List<Brand>>> {
  final dynamic _api;
  BrandsNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getBrands();
      final data = response.data['data'];
      final brands = data is List
          ? data.map((e) => Brand.fromJson(e as Map<String, dynamic>)).toList()
          : <Brand>[];
      state = AsyncValue.data(brands);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(Map<String, dynamic> data) async {
    await _api.createBrand(data);
    await load();
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    await _api.updateBrand(id, data);
    await load();
  }

  Future<void> delete(String id) async {
    await _api.deleteBrand(id);
    await load();
  }
}

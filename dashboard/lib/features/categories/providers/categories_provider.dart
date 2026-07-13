import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getCategories();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

class CategoriesNotifier extends StateNotifier<AsyncValue<List<Category>>> {
  final dynamic _api;
  CategoriesNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getCategories();
      final data = response.data['data'];
      final categories = data is List
          ? data.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList()
          : <Category>[];
      state = AsyncValue.data(categories);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(Map<String, dynamic> data) async {
    await _api.createCategory(data);
    await load();
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    await _api.updateCategory(id, data);
    await load();
  }

  Future<void> delete(String id) async {
    await _api.deleteCategory(id);
    await load();
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/medicine_model.dart';

final medicinesProvider = FutureProvider<List<Medicine>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getMedicines();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Medicine.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final medicineSearchProvider = StateProvider<String>((ref) => '');
final medicineCategoryFilterProvider = StateProvider<String>((ref) => '');
final medicinePageProvider = StateProvider<int>((ref) => 1);
final selectedMedicinesProvider = StateProvider<Set<String>>((ref) => {});

class MedicinesNotifier extends StateNotifier<AsyncValue<List<Medicine>>> {
  final dynamic _api;
  MedicinesNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getMedicines();
      final data = response.data['data'];
      final medicines = data is List
          ? data.map((e) => Medicine.fromJson(e as Map<String, dynamic>)).toList()
          : <Medicine>[];
      state = AsyncValue.data(medicines);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(Map<String, dynamic> data) async {
    await _api.createMedicine(data);
    await load();
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    await _api.updateMedicine(id, data);
    await load();
  }

  Future<void> delete(String id) async {
    await _api.deleteMedicine(id);
    await load();
  }

  Future<void> bulkDelete(List<String> ids) async {
    await _api.bulkDeleteMedicines(ids);
    await load();
  }

  Future<void> bulkUpdate(List<String> ids, Map<String, dynamic> data) async {
    await _api.bulkUpdateMedicines(ids, data);
    await load();
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../datasources/medicine_remote_datasource.dart';
import '../models/medicine_models.dart';
import '../repositories/medicine_repository.dart';

final medicineRemoteDataSourceProvider = Provider<MedicineRemoteDataSource>((ref) {
  return MedicineRemoteDataSourceImpl(dioClient: ref.watch(dioClientProvider));
});

final medicineRepositoryProvider = Provider<MedicineRepository>((ref) {
  return MedicineRepositoryImpl(
    remoteDataSource: ref.watch(medicineRemoteDataSourceProvider),
  );
});

final medicinesListProvider =
    StateNotifierProvider<MedicinesListNotifier, AsyncValue<List<MedicineListModel>>>((ref) {
  return MedicinesListNotifier(
    repository: ref.watch(medicineRepositoryProvider),
  );
});

final medicineDetailProvider =
    FutureProvider.family<MedicineDetailModel, String>((ref, id) async {
  final repository = ref.watch(medicineRepositoryProvider);
  return await repository.getMedicineDetail(id);
});

final medicineReviewsProvider =
    FutureProvider.family<List<ReviewModel>, String>((ref, medicineId) async {
  final repository = ref.watch(medicineRepositoryProvider);
  return await repository.getMedicineReviews(medicineId);
});

final searchQueryProvider = StateProvider<String>((ref) => '');

final searchResultsProvider =
    FutureProvider<List<MedicineListModel>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.isEmpty) return [];
  final repository = ref.watch(medicineRepositoryProvider);
  return await repository.searchMedicines(query);
});

class MedicinesListNotifier extends StateNotifier<AsyncValue<List<MedicineListModel>>> {
  final MedicineRepository _repository;
  int _currentPage = 1;
  bool _hasMore = true;

  MedicinesListNotifier({required MedicineRepository repository})
      : _repository = repository,
        super(const AsyncValue.loading()) {
    loadMedicines();
  }

  Future<void> loadMedicines({
    String? query,
    String? category,
    String? sortBy,
    double? minPrice,
    double? maxPrice,
  }) async {
    state = const AsyncValue.loading();
    try {
      final medicines = await _repository.getMedicines(
        page: 1,
        query: query,
        category: category,
        sortBy: sortBy,
        minPrice: minPrice,
        maxPrice: maxPrice,
      );
      _currentPage = 1;
      _hasMore = medicines.length >= 20;
      state = AsyncValue.data(medicines);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> loadMore({
    String? query,
    String? category,
    String? sortBy,
  }) async {
    if (!_hasMore) return;
    try {
      _currentPage++;
      final moreMedicines = await _repository.getMedicines(
        page: _currentPage,
        query: query,
        category: category,
        sortBy: sortBy,
      );
      _hasMore = moreMedicines.length >= 20;
      state.whenData((medicines) {
        state = AsyncValue.data([...medicines, ...moreMedicines]);
      });
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await loadMedicines();
  }
}

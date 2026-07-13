import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final bannersProvider = FutureProvider<List<BannerModel>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getBanners();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => BannerModel.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

class BannersNotifier extends StateNotifier<AsyncValue<List<BannerModel>>> {
  final dynamic _api;
  BannersNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getBanners();
      final data = response.data['data'];
      final banners = data is List
          ? data.map((e) => BannerModel.fromJson(e as Map<String, dynamic>)).toList()
          : <BannerModel>[];
      state = AsyncValue.data(banners);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(Map<String, dynamic> data) async {
    await _api.createBanner(data);
    await load();
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    await _api.updateBanner(id, data);
    await load();
  }

  Future<void> delete(String id) async {
    await _api.deleteBanner(id);
    await load();
  }

  Future<void> reorder(List<String> ids) async {
    await _api.reorderBanners(ids);
    await load();
  }
}

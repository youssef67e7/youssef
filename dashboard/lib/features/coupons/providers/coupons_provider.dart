import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final couponsProvider = FutureProvider<List<Coupon>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getCoupons();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Coupon.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

class CouponsNotifier extends StateNotifier<AsyncValue<List<Coupon>>> {
  final dynamic _api;
  CouponsNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getCoupons();
      final data = response.data['data'];
      final coupons = data is List
          ? data.map((e) => Coupon.fromJson(e as Map<String, dynamic>)).toList()
          : <Coupon>[];
      state = AsyncValue.data(coupons);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(Map<String, dynamic> data) async {
    await _api.createCoupon(data);
    await load();
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    await _api.updateCoupon(id, data);
    await load();
  }

  Future<void> delete(String id) async {
    await _api.deleteCoupon(id);
    await load();
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final offersProvider = FutureProvider<List<Offer>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getOffers();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Offer.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

class OffersNotifier extends StateNotifier<AsyncValue<List<Offer>>> {
  final dynamic _api;
  OffersNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getOffers();
      final data = response.data['data'];
      final offers = data is List
          ? data.map((e) => Offer.fromJson(e as Map<String, dynamic>)).toList()
          : <Offer>[];
      state = AsyncValue.data(offers);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(Map<String, dynamic> data) async {
    await _api.createOffer(data);
    await load();
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    await _api.updateOffer(id, data);
    await load();
  }

  Future<void> delete(String id) async {
    await _api.deleteOffer(id);
    await load();
  }
}

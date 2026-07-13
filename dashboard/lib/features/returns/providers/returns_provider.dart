import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final returnsProvider = FutureProvider<List<ReturnRequest>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getReturns();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => ReturnRequest.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final returnsFilterProvider = StateProvider<String>((ref) => '');

class ReturnsNotifier extends StateNotifier<AsyncValue<List<ReturnRequest>>> {
  final dynamic _api;
  ReturnsNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getReturns();
      final data = response.data['data'];
      final returns = data is List
          ? data.map((e) => ReturnRequest.fromJson(e as Map<String, dynamic>)).toList()
          : <ReturnRequest>[];
      state = AsyncValue.data(returns);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> approve(String id) async {
    await _api.approveReturn(id);
    await load();
  }

  Future<void> reject(String id, {String? reason}) async {
    await _api.rejectReturn(id, reason: reason);
    await load();
  }

  Future<void> processRefund(String id, Map<String, dynamic> data) async {
    await _api.processRefund(id, data);
    await load();
  }
}

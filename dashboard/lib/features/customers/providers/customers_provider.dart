import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final customersProvider = FutureProvider<List<Customer>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getCustomers();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Customer.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final customerSearchProvider = StateProvider<String>((ref) => '');
final customerPageProvider = StateProvider<int>((ref) => 1);

class CustomersNotifier extends StateNotifier<AsyncValue<List<Customer>>> {
  final dynamic _api;
  CustomersNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getCustomers();
      final data = response.data['data'];
      final customers = data is List
          ? data.map((e) => Customer.fromJson(e as Map<String, dynamic>)).toList()
          : <Customer>[];
      state = AsyncValue.data(customers);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> toggleBlock(String id) async {
    await _api.toggleBlockCustomer(id);
    await load();
  }
}

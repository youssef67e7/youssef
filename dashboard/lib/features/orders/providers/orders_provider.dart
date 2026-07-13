import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/order_model.dart';

final ordersProvider = FutureProvider<List<Order>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getOrders();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final orderStatusFilterProvider = StateProvider<String>((ref) => '');
final orderSearchProvider = StateProvider<String>((ref) => '');
final orderPageProvider = StateProvider<int>((ref) => 1);

class OrdersNotifier extends StateNotifier<AsyncValue<List<Order>>> {
  final dynamic _api;
  OrdersNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getOrders();
      final data = response.data['data'];
      final orders = data is List
          ? data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList()
          : <Order>[];
      state = AsyncValue.data(orders);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateStatus(String id, String status) async {
    await _api.updateOrderStatus(id, status);
    await load();
  }

  Future<void> assignDriver(String orderId, String driverId) async {
    await _api.assignDriver(orderId, driverId);
    await load();
  }
}

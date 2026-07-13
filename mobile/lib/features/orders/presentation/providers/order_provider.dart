import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:pharmaworld/core/network/dio_client.dart';
import 'package:pharmaworld/features/orders/data/datasources/order_remote_datasource.dart';
import 'package:pharmaworld/features/orders/data/models/order_models.dart';
import 'package:pharmaworld/features/orders/domain/repositories/order_repository.dart';

final orderRemoteDataSourceProvider = Provider<OrderRemoteDataSource>((ref) {
  return OrderRemoteDataSourceImpl(dioClient: ref.watch(dioClientProvider));
});

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepositoryImpl(
    remoteDataSource: ref.watch(orderRemoteDataSourceProvider),
  );
});

final ordersProvider =
    FutureProvider.family<List<OrderModel>, String?>((ref, status) async {
  final repository = ref.watch(orderRepositoryProvider);
  return await repository.getOrders(status: status);
});

final orderDetailProvider =
    FutureProvider.family<OrderModel, String>((ref, id) async {
  final repository = ref.watch(orderRepositoryProvider);
  return await repository.getOrderDetail(id);
});

final orderTrackingProvider =
    FutureProvider.family<OrderTrackingModel, String>((ref, id) async {
  final repository = ref.watch(orderRepositoryProvider);
  return await repository.getOrderTracking(id);
});

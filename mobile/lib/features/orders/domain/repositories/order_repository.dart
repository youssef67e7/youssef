import 'package:pharmaworld/features/orders/data/datasources/order_remote_datasource.dart';
import 'package:pharmaworld/features/orders/data/models/order_models.dart';

abstract class OrderRepository {
  Future<List<OrderModel>> getOrders({String? status, int page = 1});
  Future<OrderModel> getOrderDetail(String id);
  Future<OrderTrackingModel> getOrderTracking(String id);
  Future<void> cancelOrder(String id);
  Future<void> reorder(String id);
}

class OrderRepositoryImpl implements OrderRepository {

  OrderRepositoryImpl({required OrderRemoteDataSource remoteDataSource})
      : _remoteDataSource = remoteDataSource;
  final OrderRemoteDataSource _remoteDataSource;

  @override
  Future<List<OrderModel>> getOrders({String? status, int page = 1}) async {
    return await _remoteDataSource.getOrders(status: status, page: page);
  }

  @override
  Future<OrderModel> getOrderDetail(String id) async {
    return await _remoteDataSource.getOrderDetail(id);
  }

  @override
  Future<OrderTrackingModel> getOrderTracking(String id) async {
    return await _remoteDataSource.getOrderTracking(id);
  }

  @override
  Future<void> cancelOrder(String id) async {
    await _remoteDataSource.cancelOrder(id);
  }

  @override
  Future<void> reorder(String id) async {
    await _remoteDataSource.reorder(id);
  }
}

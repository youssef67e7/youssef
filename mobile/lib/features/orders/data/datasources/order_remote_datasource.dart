import 'package:pharmaworld/core/constants/api_constants.dart';
import 'package:pharmaworld/core/network/dio_client.dart';
import 'package:pharmaworld/features/orders/data/models/order_models.dart';

abstract class OrderRemoteDataSource {
  Future<List<OrderModel>> getOrders({String? status, int page = 1});
  Future<OrderModel> getOrderDetail(String id);
  Future<OrderTrackingModel> getOrderTracking(String id);
  Future<void> cancelOrder(String id);
  Future<void> reorder(String id);
}

class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {

  OrderRemoteDataSourceImpl({required DioClient dioClient})
      : _dioClient = dioClient;
  final DioClient _dioClient;

  @override
  Future<List<OrderModel>> getOrders({String? status, int page = 1}) async {
    final params = <String, dynamic>{
      'page': page,
      'per_page': ApiConstants.pageSize,
    };
    if (status != null) params['status'] = status;

    final response = await _dioClient.get(
      ApiConstants.orders,
      queryParameters: params,
    );
    final data = response.data['data'] as List;
    return data.map((e) => OrderModel.fromJson(e)).toList();
  }

  @override
  Future<OrderModel> getOrderDetail(String id) async {
    final response = await _dioClient.get(ApiConstants.orderById(id));
    return OrderModel.fromJson(response.data['data']);
  }

  @override
  Future<OrderTrackingModel> getOrderTracking(String id) async {
    final response = await _dioClient.get(ApiConstants.orderTracking(id));
    return OrderTrackingModel.fromJson(response.data['data']);
  }

  @override
  Future<void> cancelOrder(String id) async {
    await _dioClient.post(ApiConstants.cancelOrder(id));
  }

  @override
  Future<void> reorder(String id) async {
    await _dioClient.post(ApiConstants.reorderOrder(id));
  }
}

import 'package:freezed_annotation/freezed_annotation.dart';

part 'delivery.freezed.dart';
part 'delivery.g.dart';

@freezed
class Delivery with _$Delivery {
  const factory Delivery({
    required String id,
    required String orderId,
    required String status,
    required DeliveryAddress pickupAddress,
    required DeliveryAddress deliveryAddress,
    required Customer customer,
    required List<OrderItem> items,
    double? distance,
    int? estimatedTime,
    double? baseFee,
    double? tip,
    double? bonus,
    double? totalEarning,
    String? specialInstructions,
    String? photoUrl,
    String? signatureUrl,
    String? failureReason,
    DateTime? assignedAt,
    DateTime? acceptedAt,
    DateTime? pickedUpAt,
    DateTime? deliveredAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Delivery;

  factory Delivery.fromJson(Map<String, dynamic> json) => _$DeliveryFromJson(json);
}

@freezed
class DeliveryAddress with _$DeliveryAddress {
  const factory DeliveryAddress({
    required String address,
    required double latitude,
    required double longitude,
    String? apartment,
    String? floor,
    String? building,
    String? landmark,
  }) = _DeliveryAddress;

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) => _$DeliveryAddressFromJson(json);
}

@freezed
class Customer with _$Customer {
  const factory Customer({
    required String id,
    required String name,
    required String phone,
    String? email,
    String? profileImage,
  }) = _Customer;

  factory Customer.fromJson(Map<String, dynamic> json) => _$CustomerFromJson(json);
}

@freezed
class OrderItem with _$OrderItem {
  const factory OrderItem({
    required String id,
    required String name,
    required int quantity,
    required double price,
    String? image,
    String? notes,
  }) = _OrderItem;

  factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
}

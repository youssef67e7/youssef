import 'package:freezed_annotation/freezed_annotation.dart';

part 'order_models.freezed.dart';
part 'order_models.g.dart';

@freezed
class OrderModel with _$OrderModel {
  const factory OrderModel({
    String? id,
    String? orderNumber,
    String? status,
    double? subtotal,
    double? deliveryFee,
    double? tax,
    double? total,
    String? paymentMethod,
    String? paymentStatus,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<OrderItemModel>? items,
    AddressModel? shippingAddress,
  }) = _OrderModel;

  factory OrderModel.fromJson(Map<String, dynamic> json) =>
      _$OrderModelFromJson(json);
}

@freezed
class OrderItemModel with _$OrderItemModel {
  const factory OrderItemModel({
    String? id,
    String? medicineId,
    String? name,
    String? imageUrl,
    double? price,
    int? quantity,
    double? total,
  }) = _OrderItemModel;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) =>
      _$OrderItemModelFromJson(json);
}

@freezed
class AddressModel with _$AddressModel {
  const factory AddressModel({
    String? id,
    String? title,
    String? address,
    String? city,
    String? country,
    String? zipCode,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) = _AddressModel;

  factory AddressModel.fromJson(Map<String, dynamic> json) =>
      _$AddressModelFromJson(json);
}

@freezed
class OrderTrackingModel with _$OrderTrackingModel {
  const factory OrderTrackingModel({
    String? orderId,
    String? status,
    List<TrackingStepModel>? steps,
    DriverModel? driver,
    String? estimatedDelivery,
  }) = _OrderTrackingModel;

  factory OrderTrackingModel.fromJson(Map<String, dynamic> json) =>
      _$OrderTrackingModelFromJson(json);
}

@freezed
class TrackingStepModel with _$TrackingStepModel {
  const factory TrackingStepModel({
    String? title,
    String? description,
    String? time,
    bool? isCompleted,
  }) = _TrackingStepModel;

  factory TrackingStepModel.fromJson(Map<String, dynamic> json) =>
      _$TrackingStepModelFromJson(json);
}

@freezed
class DriverModel with _$DriverModel {
  const factory DriverModel({
    String? id,
    String? name,
    String? phone,
    String? avatar,
    double? latitude,
    double? longitude,
  }) = _DriverModel;

  factory DriverModel.fromJson(Map<String, dynamic> json) =>
      _$DriverModelFromJson(json);
}

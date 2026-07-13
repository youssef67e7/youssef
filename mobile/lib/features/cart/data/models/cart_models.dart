import 'package:freezed_annotation/freezed_annotation.dart';

part 'cart_models.freezed.dart';
part 'cart_models.g.dart';

@freezed
class CartModel with _$CartModel {
  const factory CartModel({
    List<CartItemModel>? items,
    double? subtotal,
    double? deliveryFee,
    double? tax,
    double? discount,
    double? total,
    String? couponCode,
  }) = _CartModel;

  factory CartModel.fromJson(Map<String, dynamic> json) =>
      _$CartModelFromJson(json);
}

@freezed
class CartItemModel with _$CartItemModel {
  const factory CartItemModel({
    required String id,
    required String medicineId,
    required String name,
    required double price,
    required int quantity,
    String? imageUrl,
    bool? isInStock,
  }) = _CartItemModel;

  factory CartItemModel.fromJson(Map<String, dynamic> json) =>
      _$CartItemModelFromJson(json);
}

@freezed
class CouponModel with _$CouponModel {
  const factory CouponModel({
    String? id,
    String? code,
    String? description,
    String? discountType,
    double? discountValue,
    double? minOrderAmount,
    DateTime? expiresAt,
    bool? isActive,
  }) = _CouponModel;

  factory CouponModel.fromJson(Map<String, dynamic> json) =>
      _$CouponModelFromJson(json);
}

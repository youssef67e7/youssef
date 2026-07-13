import 'package:freezed_annotation/freezed_annotation.dart';

part 'medicine_models.freezed.dart';
part 'medicine_models.g.dart';

@freezed
class MedicineDetailModel with _$MedicineDetailModel {
  const factory MedicineDetailModel({
    String? id,
    String? name,
    String? description,
    String? dosage,
    String? sideEffects,
    String? precautions,
    String? storage,
    String? manufacturer,
    double? price,
    double? originalPrice,
    double? rating,
    int? reviewCount,
    bool? isInStock,
    int? stockQuantity,
    bool? isPrescriptionRequired,
    String? category,
    String? brand,
    String? form,
    List<String>? images,
    List<String>? relatedIds,
  }) = _MedicineDetailModel;

  factory MedicineDetailModel.fromJson(Map<String, dynamic> json) =>
      _$MedicineDetailModelFromJson(json);
}

@freezed
class MedicineListModel with _$MedicineListModel {
  const factory MedicineListModel({
    String? id,
    String? name,
    String? imageUrl,
    double? price,
    double? originalPrice,
    double? rating,
    int? reviewCount,
    bool? isInStock,
  }) = _MedicineListModel;

  factory MedicineListModel.fromJson(Map<String, dynamic> json) =>
      _$MedicineListModelFromJson(json);
}

@freezed
class ReviewModel with _$ReviewModel {
  const factory ReviewModel({
    String? id,
    String? userId,
    String? userName,
    String? userAvatar,
    double? rating,
    String? comment,
    DateTime? createdAt,
  }) = _ReviewModel;

  factory ReviewModel.fromJson(Map<String, dynamic> json) =>
      _$ReviewModelFromJson(json);
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
  }) = _CartItemModel;

  factory CartItemModel.fromJson(Map<String, dynamic> json) =>
      _$CartItemModelFromJson(json);
}

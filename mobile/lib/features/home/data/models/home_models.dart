import 'package:freezed_annotation/freezed_annotation.dart';

part 'home_models.freezed.dart';
part 'home_models.g.dart';

@freezed
class HomeData with _$HomeData {
  const factory HomeData({
    List<BannerModel>? banners,
    List<CategoryModel>? categories,
    List<MedicineModel>? featuredMedicines,
    List<MedicineModel>? specialOffers,
    List<MedicineModel>? trendingMedicines,
    List<PharmacyModel>? nearbyPharmacies,
  }) = _HomeData;

  factory HomeData.fromJson(Map<String, dynamic> json) =>
      _$HomeDataFromJson(json);
}

@freezed
class BannerModel with _$BannerModel {
  const factory BannerModel({
    String? id,
    String? title,
    String? subtitle,
    String? imageUrl,
    String? link,
    String? type,
  }) = _BannerModel;

  factory BannerModel.fromJson(Map<String, dynamic> json) =>
      _$BannerModelFromJson(json);
}

@freezed
class CategoryModel with _$CategoryModel {
  const factory CategoryModel({
    String? id,
    String? name,
    String? imageUrl,
    int? productCount,
    String? parentId,
  }) = _CategoryModel;

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);
}

@freezed
class MedicineModel with _$MedicineModel {
  const factory MedicineModel({
    String? id,
    String? name,
    String? description,
    String? imageUrl,
    double? price,
    double? originalPrice,
    double? rating,
    int? reviewCount,
    bool? isInStock,
    bool? isPrescriptionRequired,
    String? category,
    String? brand,
    String? form,
  }) = _MedicineModel;

  factory MedicineModel.fromJson(Map<String, dynamic> json) =>
      _$MedicineModelFromJson(json);
}

@freezed
class PharmacyModel with _$PharmacyModel {
  const factory PharmacyModel({
    String? id,
    String? name,
    String? address,
    double? latitude,
    double? longitude,
    double? distance,
    bool? isOpen,
    String? imageUrl,
  }) = _PharmacyModel;

  factory PharmacyModel.fromJson(Map<String, dynamic> json) =>
      _$PharmacyModelFromJson(json);
}

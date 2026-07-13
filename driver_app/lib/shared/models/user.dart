import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    required String phone,
    String? profileImage,
    String? vehicleType,
    String? licensePlate,
    String? vehicleColor,
    double? rating,
    int? totalDeliveries,
    int? successfulDeliveries,
    bool? isOnline,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

@freezed
class DriverDocument with _$DriverDocument {
  const factory DriverDocument({
    required String id,
    required String type,
    required String url,
    String? fileName,
    DateTime? expiryDate,
    String? status,
    DateTime? createdAt,
  }) = _DriverDocument;

  factory DriverDocument.fromJson(Map<String, dynamic> json) => _$DriverDocumentFromJson(json);
}

import 'package:freezed_annotation/freezed_annotation.dart';

part 'api_response.freezed.dart';
part 'api_response.g.dart';

@freezed
class ApiResponse<T> with _$ApiResponse<T> {
  const factory ApiResponse({
    required bool success,
    String? message,
    T? data,
    PaginationData? pagination,
  }) = _ApiResponse;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) =>
      _$ApiResponseFromJson(json, fromJsonT);
}

@freezed
class PaginationData with _$PaginationData {
  const factory PaginationData({
    int? currentPage,
    int? lastPage,
    int? perPage,
    int? total,
    String? nextPageUrl,
    String? prevPageUrl,
  }) = _PaginationData;

  factory PaginationData.fromJson(Map<String, dynamic> json) =>
      _$PaginationDataFromJson(json);
}

@freezed
class ApiListResponse<T> with _$ApiListResponse<T> {
  const factory ApiListResponse({
    required bool success,
    String? message,
    List<T>? data,
    PaginationData? pagination,
  }) = _ApiListResponse;

  factory ApiListResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) =>
      _$ApiListResponseFromJson(json, fromJsonT);
}

@freezed
class ErrorResponse with _$ErrorResponse {
  const factory ErrorResponse({
    required bool success,
    String? message,
    Map<String, List<String>>? errors,
  }) = _ErrorResponse;

  factory ErrorResponse.fromJson(Map<String, dynamic> json) =>
      _$ErrorResponseFromJson(json);
}

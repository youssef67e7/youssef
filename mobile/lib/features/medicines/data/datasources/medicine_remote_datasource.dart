import 'package:pharmaworld/core/constants/api_constants.dart';
import 'package:pharmaworld/core/network/dio_client.dart';
import 'package:pharmaworld/features/medicines/data/models/medicine_models.dart';

abstract class MedicineRemoteDataSource {
  Future<List<MedicineListModel>> getMedicines({
    int page = 1,
    String? query,
    String? category,
    String? sortBy,
    double? minPrice,
    double? maxPrice,
  });
  Future<MedicineDetailModel> getMedicineDetail(String id);
  Future<List<MedicineListModel>> searchMedicines(String query);
  Future<MedicineDetailModel> getMedicineByBarcode(String barcode);
  Future<List<ReviewModel>> getMedicineReviews(String medicineId);
}

class MedicineRemoteDataSourceImpl implements MedicineRemoteDataSource {

  MedicineRemoteDataSourceImpl({required DioClient dioClient})
      : _dioClient = dioClient;
  final DioClient _dioClient;

  @override
  Future<List<MedicineListModel>> getMedicines({
    int page = 1,
    String? query,
    String? category,
    String? sortBy,
    double? minPrice,
    double? maxPrice,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'per_page': ApiConstants.pageSize,
    };
    if (query != null) params['q'] = query;
    if (category != null) params['category'] = category;
    if (sortBy != null) params['sort'] = sortBy;
    if (minPrice != null) params['min_price'] = minPrice;
    if (maxPrice != null) params['max_price'] = maxPrice;

    final response = await _dioClient.get(
      ApiConstants.medicines,
      queryParameters: params,
    );
    final data = response.data['data'] as List;
    return data.map((e) => MedicineListModel.fromJson(e)).toList();
  }

  @override
  Future<MedicineDetailModel> getMedicineDetail(String id) async {
    final response = await _dioClient.get(ApiConstants.medicineById(id));
    return MedicineDetailModel.fromJson(response.data['data']);
  }

  @override
  Future<List<MedicineListModel>> searchMedicines(String query) async {
    final response = await _dioClient.get(
      ApiConstants.medicineSearch,
      queryParameters: {'q': query},
    );
    final data = response.data['data'] as List;
    return data.map((e) => MedicineListModel.fromJson(e)).toList();
  }

  @override
  Future<MedicineDetailModel> getMedicineByBarcode(String barcode) async {
    final response = await _dioClient.get(ApiConstants.medicineBarcode(barcode));
    return MedicineDetailModel.fromJson(response.data['data']);
  }

  @override
  Future<List<ReviewModel>> getMedicineReviews(String medicineId) async {
    final response = await _dioClient.get(ApiConstants.medicineReviews(medicineId));
    final data = response.data['data'] as List;
    return data.map((e) => ReviewModel.fromJson(e)).toList();
  }
}

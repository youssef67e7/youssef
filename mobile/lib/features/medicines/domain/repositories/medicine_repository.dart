import 'package:pharmaworld/features/medicines/data/datasources/medicine_remote_datasource.dart';
import 'package:pharmaworld/features/medicines/data/models/medicine_models.dart';

abstract class MedicineRepository {
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

class MedicineRepositoryImpl implements MedicineRepository {

  MedicineRepositoryImpl({required MedicineRemoteDataSource remoteDataSource})
      : _remoteDataSource = remoteDataSource;
  final MedicineRemoteDataSource _remoteDataSource;

  @override
  Future<List<MedicineListModel>> getMedicines({
    int page = 1,
    String? query,
    String? category,
    String? sortBy,
    double? minPrice,
    double? maxPrice,
  }) async {
    return await _remoteDataSource.getMedicines(
      page: page,
      query: query,
      category: category,
      sortBy: sortBy,
      minPrice: minPrice,
      maxPrice: maxPrice,
    );
  }

  @override
  Future<MedicineDetailModel> getMedicineDetail(String id) async {
    return await _remoteDataSource.getMedicineDetail(id);
  }

  @override
  Future<List<MedicineListModel>> searchMedicines(String query) async {
    return await _remoteDataSource.searchMedicines(query);
  }

  @override
  Future<MedicineDetailModel> getMedicineByBarcode(String barcode) async {
    return await _remoteDataSource.getMedicineByBarcode(barcode);
  }

  @override
  Future<List<ReviewModel>> getMedicineReviews(String medicineId) async {
    return await _remoteDataSource.getMedicineReviews(medicineId);
  }
}

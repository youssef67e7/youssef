import '../../data/datasources/home_remote_datasource.dart';
import '../../data/models/home_models.dart';

abstract class HomeRepository {
  Future<HomeData> getHomeData();
  Future<List<BannerModel>> getBanners();
  Future<List<CategoryModel>> getCategories();
  Future<List<MedicineModel>> getFeaturedMedicines();
  Future<List<MedicineModel>> getSpecialOffers();
}

class HomeRepositoryImpl implements HomeRepository {
  final HomeRemoteDataSource _remoteDataSource;

  HomeRepositoryImpl({required HomeRemoteDataSource remoteDataSource})
      : _remoteDataSource = remoteDataSource;

  @override
  Future<HomeData> getHomeData() async {
    return await _remoteDataSource.getHomeData();
  }

  @override
  Future<List<BannerModel>> getBanners() async {
    return await _remoteDataSource.getBanners();
  }

  @override
  Future<List<CategoryModel>> getCategories() async {
    return await _remoteDataSource.getCategories();
  }

  @override
  Future<List<MedicineModel>> getFeaturedMedicines() async {
    return await _remoteDataSource.getFeaturedMedicines();
  }

  @override
  Future<List<MedicineModel>> getSpecialOffers() async {
    return await _remoteDataSource.getSpecialOffers();
  }
}

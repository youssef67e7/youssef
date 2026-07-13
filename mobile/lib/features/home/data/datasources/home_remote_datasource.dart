import 'package:pharmaworld/core/constants/api_constants.dart';
import 'package:pharmaworld/core/network/dio_client.dart';
import 'package:pharmaworld/features/home/data/models/home_models.dart';

abstract class HomeRemoteDataSource {
  Future<HomeData> getHomeData();
  Future<List<BannerModel>> getBanners();
  Future<List<CategoryModel>> getCategories();
  Future<List<MedicineModel>> getFeaturedMedicines();
  Future<List<MedicineModel>> getSpecialOffers();
}

class HomeRemoteDataSourceImpl implements HomeRemoteDataSource {

  HomeRemoteDataSourceImpl({required DioClient dioClient})
      : _dioClient = dioClient;
  final DioClient _dioClient;

  @override
  Future<HomeData> getHomeData() async {
    final response = await _dioClient.get(ApiConstants.homeData);
    return HomeData.fromJson(response.data['data']);
  }

  @override
  Future<List<BannerModel>> getBanners() async {
    final response = await _dioClient.get(ApiConstants.banners);
    final data = response.data['data'] as List;
    return data.map((e) => BannerModel.fromJson(e)).toList();
  }

  @override
  Future<List<CategoryModel>> getCategories() async {
    final response = await _dioClient.get(ApiConstants.categories);
    final data = response.data['data'] as List;
    return data.map((e) => CategoryModel.fromJson(e)).toList();
  }

  @override
  Future<List<MedicineModel>> getFeaturedMedicines() async {
    final response = await _dioClient.get(
      ApiConstants.medicines,
      queryParameters: {'featured': true, 'per_page': 10},
    );
    final data = response.data['data'] as List;
    return data.map((e) => MedicineModel.fromJson(e)).toList();
  }

  @override
  Future<List<MedicineModel>> getSpecialOffers() async {
    final response = await _dioClient.get(
      ApiConstants.medicines,
      queryParameters: {'on_sale': true, 'per_page': 10},
    );
    final data = response.data['data'] as List;
    return data.map((e) => MedicineModel.fromJson(e)).toList();
  }
}

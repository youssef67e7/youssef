import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../datasources/home_remote_datasource.dart';
import '../models/home_models.dart';
import '../repositories/home_repository.dart';

final homeRemoteDataSourceProvider = Provider<HomeRemoteDataSource>((ref) {
  return HomeRemoteDataSourceImpl(dioClient: ref.watch(dioClientProvider));
});

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepositoryImpl(
    remoteDataSource: ref.watch(homeRemoteDataSourceProvider),
  );
});

final homeDataProvider = FutureProvider<HomeData>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  return await repository.getHomeData();
});

final bannersProvider = FutureProvider<List<BannerModel>>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  return await repository.getBanners();
});

final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  return await repository.getCategories();
});

final featuredMedicinesProvider = FutureProvider<List<MedicineModel>>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  return await repository.getFeaturedMedicines();
});

final specialOffersProvider = FutureProvider<List<MedicineModel>>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  return await repository.getSpecialOffers();
});

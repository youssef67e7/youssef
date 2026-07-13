import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:pharmaworld_driver/core/network/dio_client.dart';
import 'package:pharmaworld_driver/core/network/network_info.dart';
import 'package:pharmaworld_driver/features/auth/repository/auth_repository.dart';
import 'package:pharmaworld_driver/features/auth/service/auth_service.dart';
import 'package:pharmaworld_driver/features/deliveries/repository/delivery_repository.dart';
import 'package:pharmaworld_driver/features/deliveries/service/delivery_service.dart';
import 'package:pharmaworld_driver/features/earnings/provider/earnings_provider.dart';
import 'package:pharmaworld_driver/features/profile/provider/profile_provider.dart';
import 'package:pharmaworld_driver/features/home/provider/home_provider.dart';
import 'package:pharmaworld_driver/features/settings/provider/settings_provider.dart';

class Injection {
  static final FlutterSecureStorage _storage = const FlutterSecureStorage();
  static final Connectivity _connectivity = Connectivity();
  static final NetworkInfo _networkInfo = NetworkInfo(_connectivity);
  static final DioClient _dioClient = DioClient(_storage);

  static FlutterSecureStorage get storage => _storage;
  static NetworkInfo get networkInfo => _networkInfo;
  static DioClient get dioClient => _dioClient;

  static AuthService get authService => AuthService(
        dioClient: _dioClient,
        storage: _storage,
      );

  static AuthRepository get authRepository => AuthRepository(
        authService: authService,
        storage: _storage,
      );

  static DeliveryService get deliveryService => DeliveryService(
        dioClient: _dioClient,
      );

  static DeliveryRepository get deliveryRepository => DeliveryRepository(
        deliveryService: deliveryService,
      );

  static final Map<String, dynamic> providers = {
    'storage': _storage,
    'networkInfo': _networkInfo,
    'dioClient': _dioClient,
    'authService': authService,
    'authRepository': authRepository,
    'deliveryService': deliveryService,
    'deliveryRepository': deliveryRepository,
  };
}

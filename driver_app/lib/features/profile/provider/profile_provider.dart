import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/core/di/injection.dart';
import 'package:pharmaworld_driver/core/network/dio_client.dart';
import 'package:pharmaworld_driver/core/constants/api_constants.dart';
import 'package:pharmaworld_driver/shared/models/user.dart';
import 'package:pharmaworld_driver/shared/providers/auth_provider.dart';

final profileServiceProvider = Provider((ref) {
  return ProfileService(dioClient: ref.watch(dioClientProvider));
});

final dioClientProvider = Provider((ref) {
  return Injection.dioClient;
});

class ProfileService {
  final DioClient _dioClient;

  ProfileService({required DioClient dioClient}) : _dioClient = dioClient;

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dioClient.get(ApiConstants.profile);
    return response.data;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dioClient.put(
      ApiConstants.updateProfile,
      data: data,
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getDocuments() async {
    final response = await _dioClient.get(ApiConstants.documents);
    return response.data;
  }

  Future<Map<String, dynamic>> uploadDocument(Map<String, dynamic> data) async {
    final response = await _dioClient.post(
      ApiConstants.uploadDocument,
      data: data,
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getStatistics() async {
    final response = await _dioClient.get(ApiConstants.statistics);
    return response.data;
  }
}

final profileProvider = FutureProvider<User>((ref) async {
  final service = ref.watch(profileServiceProvider);
  try {
    final response = await service.getProfile();
    return User.fromJson(response['user']);
  } catch (e) {
    return const User(
      id: '',
      name: '',
      email: '',
      phone: '',
    );
  }
});

final statisticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.watch(profileServiceProvider);
  try {
    return await service.getStatistics();
  } catch (e) {
    return {
      'totalDeliveries': 0,
      'successfulDeliveries': 0,
      'rating': 0.0,
      'completionRate': 0.0,
    };
  }
});

final updateProfileProvider = StateNotifierProvider<UpdateProfileNotifier, AsyncValue<void>>((ref) {
  return UpdateProfileNotifier(ref);
});

class UpdateProfileNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  UpdateProfileNotifier(this._ref) : super(const AsyncValue.data(null));

  Future<void> updateProfile(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(profileServiceProvider).updateProfile(data);
      _ref.invalidate(profileProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

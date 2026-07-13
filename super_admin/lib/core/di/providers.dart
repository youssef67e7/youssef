import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/dio_client.dart';
import '../network/api_service.dart';
import '../constants/storage.dart';
import '../../shared/providers/auth_provider.dart';

final dioClientProvider = Provider<DioClient>((ref) => DioClient());
final apiServiceProvider = Provider<ApiService>((ref) => ApiService(ref.read(dioClientProvider)));

Future<void> initProviders() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString(StorageKeys.token);
  if (token != null) {
    final dioClient = DioClient();
    await dioClient.setToken(token);
  }
}

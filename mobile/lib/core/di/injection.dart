import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:pharmaworld/core/network/dio_client.dart';
import 'package:pharmaworld/shared/providers/auth_provider.dart';

final sharedPreferencesProvider = FutureProvider<SharedPreferences>((ref) async {
  return SharedPreferences.getInstance();
});

final initializationProvider = FutureProvider<void>((ref) async {
  final prefs = await ref.watch(sharedPreferencesProvider.future);
  final dioClient = ref.watch(dioClientProvider);

  await dioClient.loadTokens();

  ref.read(authStateProvider.notifier).checkAuthStatus();
});

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/network/dio_client.dart';
import '../core/network/network_info.dart';
import '../shared/providers/auth_provider.dart';
import '../shared/providers/locale_provider.dart';
import '../shared/providers/theme_provider.dart';

final sharedPreferencesProvider = FutureProvider<SharedPreferences>((ref) async {
  return SharedPreferences.getInstance();
});

final initializationProvider = FutureProvider<void>((ref) async {
  final prefs = await ref.watch(sharedPreferencesProvider.future);
  final dioClient = ref.watch(dioClientProvider);

  await dioClient.loadTokens();

  ref.read(themeModeProvider.notifier)._loadTheme();
  ref.read(localeProvider.notifier)._loadLocale();
  ref.read(authStateProvider.notifier).checkAuthStatus();
});

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:pharmaworld_driver/app.dart';
import 'package:pharmaworld_driver/core/constants/storage_keys.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  final prefs = await SharedPreferences.getInstance();
  final darkMode = prefs.getBool(StorageKeys.darkMode) ?? false;
  final language = prefs.getString(StorageKeys.language) ?? 'en';

  runApp(
    ProviderScope(
      overrides: [
        darkModeProvider.overrideWithValue(darkMode),
        languageProvider.overrideWithValue(language),
      ],
      child: const PharmaWorldDriverApp(),
    ),
  );
}

final darkModeProvider = StateProvider<bool>((ref) => false);
final languageProvider = StateProvider<String>((ref) => 'en');

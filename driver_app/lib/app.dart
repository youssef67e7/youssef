import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/core/theme/app_theme.dart';
import 'package:pharmaworld_driver/core/router/app_router.dart';
import 'package:pharmaworld_driver/core/localization/l10n.dart';
import 'package:pharmaworld_driver/main.dart';

class PharmaWorldDriverApp extends ConsumerWidget {
  const PharmaWorldDriverApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);
    final isDarkMode = ref.watch(darkModeProvider);
    final language = ref.watch(languageProvider);

    return MaterialApp.router(
      title: 'PharmaWorld Driver',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      routerConfig: router,
      locale: Locale(language),
      localizationsDelegates: LocalizationConfig.localizationsDelegates,
      supportedLocales: LocalizationConfig.supportedLocales,
      localeResolutionCallback: LocalizationConfig.localeResolutionCallback,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:pharmaworld_dashboard/core/router/app_router.dart';
import 'package:pharmaworld_dashboard/core/theme/app_theme.dart';
import 'package:pharmaworld_dashboard/core/localization/app_localizations.dart';
import 'package:pharmaworld_dashboard/shared/providers/locale_provider.dart';
import 'package:pharmaworld_dashboard/shared/providers/theme_provider.dart';

class PharmaWorldApp extends ConsumerWidget {
  const PharmaWorldApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);

    return MaterialApp.router(
      title: 'PharmaWorld Dashboard',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      locale: locale,
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('ar', 'SA'),
      ],
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}

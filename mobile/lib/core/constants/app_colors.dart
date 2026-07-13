import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primaryLight = Color(0xFF00897B);
  static const Color primaryDark = Color(0xFF4DB6AC);
  static const Color secondaryLight = Color(0xFFFF6F00);
  static const Color secondaryDark = Color(0xFFFFB74D);
  static const Color errorLight = Color(0xFFE53935);
  static const Color errorDark = Color(0xFFEF5350);
  static const Color successLight = Color(0xFF43A047);
  static const Color successDark = Color(0xFF66BB6A);
  static const Color warningLight = Color(0xFFFFA000);
  static const Color warningDark = Color(0xFFFFCA28);
  static const Color infoLight = Color(0xFF1E88E5);
  static const Color infoDark = Color(0xFF42A5F5);

  static const Color surfaceLight = Color(0xFFF5F5F5);
  static const Color surfaceDark = Color(0xFF1E1E1E);
  static const Color backgroundLight = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color cardDark = Color(0xFF1E1E1E);
  static const Color scaffoldLight = Color(0xFFF8F9FA);
  static const Color scaffoldDark = Color(0xFF0D0D0D);

  static const Color textPrimaryLight = Color(0xFF212121);
  static const Color textPrimaryDark = Color(0xFFE0E0E0);
  static const Color textSecondaryLight = Color(0xFF757575);
  static const Color textSecondaryDark = Color(0xFF9E9E9E);
  static const Color textHintLight = Color(0xFFBDBDBD);
  static const Color textHintDark = Color(0xFF616161);
  static const Color dividerLight = Color(0xFFE0E0E0);
  static const Color dividerDark = Color(0xFF424242);

  static const Color priceColor = Color(0xFFE53935);
  static const Color discountColor = Color(0xFFFF6F00);
  static const Color ratingColor = Color(0xFFFFC107);
  static const Color inStockColor = Color(0xFF43A047);
  static const Color outOfStockColor = Color(0xFFE53935);

  static const Color pendingColor = Color(0xFFFFA000);
  static const Color confirmedColor = Color(0xFF1E88E5);
  static const Color processingColor = Color(0xFF7B1FA2);
  static const Color shippedColor = Color(0xFF00897B);
  static const Color deliveredColor = Color(0xFF43A047);
  static const Color cancelledColor = Color(0xFFE53935);

  static const Color facebookColor = Color(0xFF1877F2);
  static const Color googleColor = Color(0xFFDB4437);
  static const Color twitterColor = Color(0xFF1DA1F2);
  static const Color whatsappColor = Color(0xFF25D366);
}

class AppColorSchemes {
  static ColorScheme lightColorScheme = const ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.primaryLight,
    onPrimary: Colors.white,
    primaryContainer: Color(0xFFB2DFDB),
    onPrimaryContainer: Color(0xFF00251E),
    secondary: AppColors.secondaryLight,
    onSecondary: Colors.white,
    secondaryContainer: Color(0xFFFFE0B2),
    onSecondaryContainer: Color(0xFF331200),
    tertiary: Color(0xFF5C6BC0),
    onTertiary: Colors.white,
    tertiaryContainer: Color(0xFFC5CAE9),
    onTertiaryContainer: Color(0xFF1A237E),
    error: AppColors.errorLight,
    onError: Colors.white,
    errorContainer: Color(0xFFFFCDD2),
    onErrorContainer: Color(0xFF410002),
    surface: AppColors.surfaceLight,
    onSurface: AppColors.textPrimaryLight,
    onSurfaceVariant: AppColors.textSecondaryLight,
    outline: AppColors.dividerLight,
    outlineVariant: Color(0xFFE0E0E0),
    shadow: Color(0x1F000000),
    scrim: Color(0x52000000),
    inverseSurface: Color(0xFF2E2E2E),
    onInverseSurface: Color(0xFFF5F5F5),
    inversePrimary: AppColors.primaryDark,
    surfaceTint: AppColors.primaryLight,
    surfaceContainerLowest: Color(0xFFFFFFFF),
    surfaceContainerLow: Color(0xFFFAFAFA),
    surfaceContainer: Color(0xFFF5F5F5),
    surfaceContainerHigh: Color(0xFFEEEEEE),
    surfaceContainerHighest: Color(0xFFE0E0E0),
  );

  static ColorScheme darkColorScheme = const ColorScheme(
    brightness: Brightness.dark,
    primary: AppColors.primaryDark,
    onPrimary: Color(0xFF003830),
    primaryContainer: Color(0xFF005048),
    onPrimaryContainer: Color(0xFFB2DFDB),
    secondary: AppColors.secondaryDark,
    onSecondary: Color(0xFF331200),
    secondaryContainer: Color(0xFF4A2600),
    onSecondaryContainer: Color(0xFFFFE0B2),
    tertiary: Color(0xFF9FA8DA),
    onTertiary: Color(0xFF1A237E),
    tertiaryContainer: Color(0xFF283593),
    onTertiaryContainer: Color(0xFFC5CAE9),
    error: AppColors.errorDark,
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF8C0009),
    onErrorContainer: Color(0xFFFFDAD6),
    surface: AppColors.surfaceDark,
    onSurface: AppColors.textPrimaryDark,
    onSurfaceVariant: AppColors.textSecondaryDark,
    outline: AppColors.dividerDark,
    outlineVariant: Color(0xFF424242),
    shadow: Color(0x3D000000),
    scrim: Color(0x89000000),
    inverseSurface: Color(0xFFE0E0E0),
    onInverseSurface: Color(0xFF2E2E2E),
    inversePrimary: AppColors.primaryLight,
    surfaceTint: AppColors.primaryDark,
    surfaceContainerLowest: Color(0xFF0D0D0D),
    surfaceContainerLow: Color(0xFF1A1A1A),
    surfaceContainer: Color(0xFF222222),
    surfaceContainerHigh: Color(0xFF2C2C2C),
    surfaceContainerHighest: Color(0xFF373737),
  );
}

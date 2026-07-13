import 'package:flutter/material.dart';

class AppLocalizations {
  AppLocalizations._();

  static AppLocalizations? of(BuildContext context) => null;

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  String? get accept => null;
  String? get accepted => null;
  String? get activeDelivery => null;
  String? get arabic => null;
  String? get appTitle => null;
  String? get areYouSure => null;
  String? get availabilitySchedule => null;
  String? get averageRating => null;
  String? get baseFee => null;
  String? get bonuses => null;
  String? get call => null;
  String? get cancel => null;
  String? get completedDeliveries => null;
  String? get completionRate => null;
  String? get confirm => null;
  String? get customerName => null;
  String? get darkMode => null;
  String? get decline => null;
  String? get delivered => null;
  String? get deliveryLocation => null;
  String? get deliveryQueue => null;
  String? get deliveries => null;
  String? get distance => null;
  String? get documents => null;
  String? get didntReceiveCode => null;
  String? get dropoff => null;
  String? get editProfile => null;
  String? get email => null;
  String? get english => null;
  String? get enterOtp => null;
  String? get enterPhone => null;
  String? get earnings => null;
  String? get earningsHistory => null;
  String? get earningsWillAppear => null;
  String? get estimatedTime => null;
  String? get failed => null;
  String? get failedToLoad => null;
  String? get getDirections => null;
  String? get home => null;
  String? get items => null;
  String? get language => null;
  String? get licensePlate => null;
  String? get logout => null;
  String? get monthlyEarnings => null;
  String? get name => null;
  String? get noActiveDelivery => null;
  String? get noDeliveries => null;
  String? get noEarningsYet => null;
  String? get notifications => null;
  String? get order => null;
  String? get orderDetails => null;
  String? get orderSummary => null;
  String? get otpVerification => null;
  String? get phone => null;
  String? get phoneLabel => null;
  String? get pickup => null;
  String? get pickupLocation => null;
  String? get pickedUp => null;
  String? get profile => null;
  String? get quantity => null;
  String? get rating => null;
  String? get resend => null;
  String? get routeMap => null;
  String? get save => null;
  String? get sendOtp => null;
  String? get settings => null;
  String? get signInToContinue => null;
  String? get specialInstructions => null;
  String? get successRate => null;
  String? get today => null;
  String? get todayEarnings => null;
  String? get todaysDeliveries => null;
  String? get todaysEarnings => null;
  String? get total => null;
  String? get totalDeliveries => null;
  String? get totalEarnings => null;
  String? get tryAgain => null;
  String? get thisWeek => null;
  String? get thisMonth => null;
  String? get tips => null;
  String? get vehicleInfo => null;
  String? get vehicleType => null;
  String? get verifyOtp => null;
  String? get weeklyEarnings => null;
  String? get withdraw => null;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) =>
      ['en', 'ar'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async => AppLocalizations._();

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}


class AppDurations {
  AppDurations._();

  static const Duration instant = Duration(milliseconds: 100);
  static const Duration fast = Duration(milliseconds: 200);
  static const Duration normal = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 500);
  static const Duration verySlow = Duration(milliseconds: 800);
  static const Duration pageTransition = Duration(milliseconds: 350);
  static const Duration splashDuration = Duration(seconds: 2);
  static const Duration autoLoginDelay = Duration(seconds: 3);
  static const Duration otpResend = Duration(seconds: 60);
  static const Duration autoRefresh = Duration(minutes: 5);
  static const Duration debounceDelay = Duration(milliseconds: 500);
  static const Duration animationDuration = Duration(milliseconds: 300);

  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 400);
  static const Duration longAnimation = Duration(milliseconds: 600);
}

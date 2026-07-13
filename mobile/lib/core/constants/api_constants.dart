import 'package:dio/dio.dart';

class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'https://api.pharmaworld.com/api/v1';
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
  static const int pageSize = 20;

  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh-token';
  static const String logout = '/auth/logout';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String verifyEmail = '/auth/verify-email';
  static const String verifyPhone = '/auth/verify-phone';
  static const String verifyOtp = '/auth/verify-mfa';
  static const String resendOtp = '/auth/send-otp';
  static const String socialLogin = '/auth/social-login';
  static const String updateFcmToken = '/auth/update-fcm-token';
  static const String profile = '/auth/me';

  static const String medicines = '/medicines';
  static String medicineById(String id) => '/medicines/$id';
  static const String medicineSearch = '/search';
  static String medicineBarcode(String barcode) => '/medicines/barcode/$barcode';
  static String medicineReviews(String id) => '/reviews/medicine/$id';
  static const String categories = '/categories';
  static const String brands = '/brands';
  static const String homeData = '/health';
  static const String banners = '/banners/active';
  static const String offers = '/offers/active';

  static const String cart = '/cart';
  static const String orders = '/orders';
  static String orderById(String id) => '/orders/$id';
  static String orderTracking(String id) => '/orders/track/$id';
  static String cancelOrder(String id) => '/orders/$id/cancel';
  static String reorderOrder(String id) => '/orders/$id';

  static const String payments = '/payments';
  static const String addresses = '/addresses';
  static const String coupons = '/coupons';
  static const String wallet = '/wallet';
  static const String loyaltyPoints = '/loyalty-points';
  static const String reviews = '/reviews';
  static const String notifications = '/notifications';
  static const String referrals = '/referrals';
  static const String support = '/support';
  static const String returns = '/returns';
  static const String upload = '/upload';
  static const String users = '/users';
  static const String search = '/search';
  static const String analytics = '/analytics';
  static const String health = '/health';
}

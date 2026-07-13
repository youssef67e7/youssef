class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'https://api.pharmaworld.com';
  static const String apiVersion = '/api/v1';

  static const String login = '$apiVersion/auth/login';
  static const String register = '$apiVersion/auth/register';
  static const String logout = '$apiVersion/auth/logout';
  static const String refreshToken = '$apiVersion/auth/refresh';
  static const String forgotPassword = '$apiVersion/auth/forgot-password';
  static const String resetPassword = '$apiVersion/auth/reset-password';
  static const String verifyEmail = '$apiVersion/auth/verify-email';
  static const String verifyPhone = '$apiVersion/auth/verify-phone';
  static const String verifyOtp = '$apiVersion/auth/verify-otp';
  static const String resendOtp = '$apiVersion/auth/resend-otp';
  static const String socialLogin = '$apiVersion/auth/social-login';
  static const String updateFcmToken = '$apiVersion/auth/fcm-token';

  static const String userProfile = '$apiVersion/user/profile';
  static const String updateProfile = '$apiVersion/user/profile';
  static const String updateAvatar = '$apiVersion/user/avatar';
  static const String changePassword = '$apiVersion/user/change-password';
  static const String deleteAccount = '$apiVersion/user/account';

  static const String categories = '$apiVersion/categories';
  static String categoryById(String id) => '$apiVersion/categories/$id';
  static String categoryProducts(String id) => '$apiVersion/categories/$id/products';

  static const String medicines = '$apiVersion/medicines';
  static String medicineById(String id) => '$apiVersion/medicines/$id';
  static const String medicineSearch = '$apiVersion/medicines/search';
  static String medicineBarcode(String barcode) => '$apiVersion/medicines/barcode/$barcode';
  static String medicineReviews(String id) => '$apiVersion/medicines/$id/reviews';
  static String medicineRelated(String id) => '$apiVersion/medicines/$id/related';

  static const String cart = '$apiVersion/cart';
  static String cartItem(String id) => '$apiVersion/cart/$id';
  static const String applyCoupon = '$apiVersion/cart/coupon';
  static const String removeCoupon = '$apiVersion/cart/coupon';

  static const String addresses = '$apiVersion/addresses';
  static String addressById(String id) => '$apiVersion/addresses/$id';
  static String setDefaultAddress(String id) => '$apiVersion/addresses/$id/default';

  static const String orders = '$apiVersion/orders';
  static String orderById(String id) => '$apiVersion/orders/$id';
  static String orderTracking(String id) => '$apiVersion/orders/$id/tracking';
  static String cancelOrder(String id) => '$apiVersion/orders/$id/cancel';
  static String reorderOrder(String id) => '$apiVersion/orders/$id/reorder';
  static String returnOrder(String id) => '$apiVersion/orders/$id/return';
  static String exchangeOrder(String id) => '$apiVersion/orders/$id/exchange';

  static const String wishlist = '$apiVersion/wishlist';
  static String wishlistItem(String id) => '$apiVersion/wishlist/$id';

  static const String reviews = '$apiVersion/reviews';
  static String reviewById(String id) => '$apiVersion/reviews/$id';

  static const String notifications = '$apiVersion/notifications';
  static String notificationRead(String id) => '$apiVersion/notifications/$id/read';
  static const String markAllRead = '$apiVersion/notifications/read-all';

  static const String wallet = '$apiVersion/wallet';
  static const String walletTopUp = '$apiVersion/wallet/topup';
  static const String walletTransactions = '$apiVersion/wallet/transactions';

  static const String coupons = '$apiVersion/coupons';
  static const String myCoupons = '$apiVersion/coupons/my';
  static String applyCouponCode = '$apiVersion/coupons/apply';

  static const String loyalty = '$apiVersion/loyalty';
  static const String loyaltyPoints = '$apiVersion/loyalty/points';
  static const String loyaltyHistory = '$apiVersion/loyalty/history';
  static const String loyaltyRedeem = '$apiVersion/loyalty/redeem';
  static const String loyaltyTier = '$apiVersion/loyalty/tier';

  static const String referrals = '$apiVersion/referrals';
  static const String referralCode = '$apiVersion/referrals/code';
  static const String referralHistory = '$apiVersion/referrals/history';

  static const String supportTickets = '$apiVersion/support/tickets';
  static String ticketById(String id) => '$apiVersion/support/tickets/$id';
  static String ticketReply(String id) => '$apiVersion/support/tickets/$id/reply';

  static const String banners = '$apiVersion/banners';
  static const String homeData = '$apiVersion/home';
  static const String pharmacies = '$apiVersion/pharmacies';
  static String pharmacyById(String id) => '$apiVersion/pharmacies/$id';

  static const String settings = '$apiVersion/settings';
  static const String about = '$apiVersion/about';

  static const int pageSize = 20;
  static const int maxRetry = 3;
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}

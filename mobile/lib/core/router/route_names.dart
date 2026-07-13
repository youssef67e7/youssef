class RouteNames {
  RouteNames._();

  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';
  static const String verifyEmail = '/verify-email';
  static const String verifyPhone = '/verify-phone';
  static const String otpVerification = '/otp-verification';

  static const String home = '/home';
  static const String categories = '/categories';
  static const String categoryDetail = '/categories/:id';
  static const String medicines = '/medicines';
  static const String medicineDetail = '/medicines/:id';
  static const String medicineSearch = '/medicines/search';
  static const String barcodeScanner = '/barcode-scanner';

  static const String cart = '/cart';
  static const String checkout = '/checkout';

  static const String orders = '/orders';
  static const String orderDetail = '/orders/:id';
  static const String orderTracking = '/orders/:id/tracking';

  static const String wishlist = '/wishlist';
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String changePassword = '/profile/change-password';

  static const String addresses = '/addresses';
  static const String addAddress = '/addresses/add';
  static const String editAddress = '/addresses/:id/edit';

  static const String notifications = '/notifications';

  static const String wallet = '/wallet';

  static const String coupons = '/coupons';
  static const String myCoupons = '/coupons/my';

  static const String reviews = '/reviews';
  static const String writeReview = '/reviews/write/:medicineId';
  static const String editReview = '/reviews/:id/edit';
  static const String myReviews = '/reviews/my';

  static const String loyalty = '/loyalty';

  static const String referral = '/referral';

  static const String support = '/support';
  static const String createTicket = '/support/create';
  static const String ticketDetail = '/support/:id';

  static const String settings = '/settings';
  static const String about = '/settings/about';
  static const String privacyPolicy = '/settings/privacy';
  static const String termsOfService = '/settings/terms';

  static const String medicineByBarcode = '/medicines/barcode/:barcode';

  static String categoryDetailPath(String id) => '/categories/$id';
  static String medicineDetailPath(String id) => '/medicines/$id';
  static String orderDetailPath(String id) => '/orders/$id';
  static String orderTrackingPath(String id) => '/orders/$id/tracking';
  static String editAddressPath(String id) => '/addresses/$id/edit';
  static String writeReviewPath(String medicineId) => '/reviews/write/$medicineId';
  static String editReviewPath(String id) => '/reviews/$id/edit';
  static String ticketDetailPath(String id) => '/support/$id';
  static String medicineByBarcodePath(String barcode) => '/medicines/barcode/$barcode';
}

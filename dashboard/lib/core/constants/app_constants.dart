class AppConstants {
  AppConstants._();

  static const String appName = 'PharmaWorld';
  static const String appVersion = '1.0.0';
  static const String baseUrl = 'https://api.pharmaworld.com';
  static const String devBaseUrl = 'http://localhost:3000';
  static const String apiVersion = '/api/v1';

  static const Duration timeout = Duration(seconds: 30);
  static const Duration cacheDuration = Duration(minutes: 5);

  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String localeKey = 'locale';
  static const String themeKey = 'theme_mode';

  static const List<String> supportedLanguages = ['en', 'ar'];
  static const Locale defaultLocale = Locale('en', 'US');

  static const double sidebarWidth = 260.0;
  static const double sidebarCollapsedWidth = 72.0;
  static const double headerHeight = 64.0;
  static const double mobileBreakpoint = 600.0;
  static const double tabletBreakpoint = 1024.0;
  static const double desktopBreakpoint = 1440.0;

  static const List<Map<String, String>> orderStatuses = [
    {'key': 'pending', 'label_en': 'Pending', 'label_ar': 'قيد الانتظار'},
    {'key': 'confirmed', 'label_en': 'Confirmed', 'label_ar': 'مؤكد'},
    {'key': 'preparing', 'label_en': 'Preparing', 'label_ar': 'يتم التجهيز'},
    {'key': 'ready', 'label_en': 'Ready', 'label_ar': 'جاهز'},
    {'key': 'out_for_delivery', 'label_en': 'Out for Delivery', 'label_ar': 'خرج للتوصيل'},
    {'key': 'delivered', 'label_en': 'Delivered', 'label_ar': 'تم التوصيل'},
    {'key': 'cancelled', 'label_en': 'Cancelled', 'label_ar': 'ملغي'},
    {'key': 'returned', 'label_en': 'Returned', 'label_ar': 'مرتجع'},
  ];

  static const List<Map<String, String>> paymentMethods = [
    {'key': 'cash_on_delivery', 'label_en': 'Cash on Delivery', 'label_ar': 'الدفع عند الاستلام'},
    {'key': 'credit_card', 'label_en': 'Credit Card', 'label_ar': 'بطاقة ائتمان'},
    {'key': 'debit_card', 'label_en': 'Debit Card', 'label_ar': 'بطاقة خصم'},
    {'key': 'apple_pay', 'label_en': 'Apple Pay', 'label_ar': 'أبل باي'},
    {'key': 'mada', 'label_en': 'Mada', 'label_ar': 'مدى'},
    {'key': 'stc_pay', 'label_en': 'STC Pay', 'label_ar': 'STC Pay'},
  ];
}

class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'https://api.pharmaworld.com';
  static const String apiVersion = '/api/v1';

  static const String login = '$apiVersion/driver/login';
  static const String verifyOtp = '$apiVersion/driver/verify-otp';
  static const String resendOtp = '$apiVersion/driver/resend-otp';
  static const String profile = '$apiVersion/driver/profile';
  static const String updateProfile = '$apiVersion/driver/profile/update';
  static const String toggleOnline = '$apiVersion/driver/online-toggle';
  static const String activeDelivery = '$apiVersion/driver/active-delivery';
  static const String deliveryQueue = '$apiVersion/driver/delivery-queue';
  static const String completedDeliveries = '$apiVersion/driver/completed-deliveries';
  static const String acceptDelivery = '$apiVersion/driver/accept-delivery';
  static const String declineDelivery = '$apiVersion/driver/decline-delivery';
  static const String updateStatus = '$apiVersion/driver/update-status';
  static const String confirmDelivery = '$apiVersion/driver/confirm-delivery';
  static const String failDelivery = '$apiVersion/driver/fail-delivery';
  static const String uploadPhoto = '$apiVersion/driver/upload-photo';
  static const String earnings = '$apiVersion/driver/earnings';
  static const String earningsHistory = '$apiVersion/driver/earnings/history';
  static const String withdraw = '$apiVersion/driver/withdraw';
  static const String statistics = '$apiVersion/driver/statistics';
  static const String documents = '$apiVersion/driver/documents';
  static const String uploadDocument = '$apiVersion/driver/documents/upload';
  static const String notifications = '$apiVersion/driver/notifications';
  static const String readNotification = '$apiVersion/driver/notifications/read';
  static const String settings = '$apiVersion/driver/settings';
  static const String updateSettings = '$apiVersion/driver/settings/update';
}

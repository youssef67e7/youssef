import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld/core/constants/api_constants.dart';
import 'package:pharmaworld/core/network/dio_client.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return ApiService(dio);
});

class ApiService {
  final Dio _dio;
  ApiService(this._dio);

  // Auth
  Future<Response> login(String email, String password) => _dio.post(ApiConstants.login, data: {'email': email, 'password': password});
  Future<Response> register(Map<String, dynamic> data) => _dio.post(ApiConstants.register, data: data);
  Future<Response> getProfile() => _dio.get(ApiConstants.profile);
  Future<Response> updateProfile(Map<String, dynamic> data) => _dio.patch(ApiConstants.profile, data: data);
  Future<Response> changePassword(String currentPassword, String newPassword) => _dio.post('/auth/change-password', data: {'currentPassword': currentPassword, 'newPassword': newPassword});
  Future<Response> forgotPassword(String email) => _dio.post(ApiConstants.forgotPassword, data: {'email': email});
  Future<Response> resetPassword(String token, String password) => _dio.post(ApiConstants.resetPassword, data: {'token': token, 'password': password});
  Future<Response> verifyPhone(String phone, String code) => _dio.post(ApiConstants.verifyPhone, data: {'phone': phone, 'code': code});
  Future<Response> verifyEmail(String token) => _dio.post(ApiConstants.verifyEmail, data: {'token': token});
  Future<Response> updateFcmToken(String token) => _dio.post(ApiConstants.updateFcmToken, data: {'fcmToken': token});
  Future<Response> logout() => _dio.post(ApiConstants.logout);

  // Home
  Future<Response> getHomeData() => _dio.get(ApiConstants.homeData);
  Future<Response> getBanners() => _dio.get(ApiConstants.banners);
  Future<Response> getOffers() => _dio.get(ApiConstants.offers);

  // Medicines
  Future<Response> getMedicines({String? category, String? brand, String? search, int page = 1, int limit = 20}) => _dio.get(ApiConstants.medicines, queryParameters: {'category': category, 'brand': brand, 'search': search, 'page': page, 'limit': limit});
  Future<Response> getMedicineById(String id) => _dio.get(ApiConstants.medicineById(id));
  Future<Response> searchMedicines(String query) => _dio.get(ApiConstants.medicineSearch, queryParameters: {'q': query});
  Future<Response> getMedicineByBarcode(String barcode) => _dio.get(ApiConstants.medicineBarcode(barcode));
  Future<Response> getMedicineReviews(String medicineId, {int page = 1, int limit = 20}) => _dio.get(ApiConstants.medicineReviews(medicineId), queryParameters: {'page': page, 'limit': limit});

  // Categories & Brands
  Future<Response> getCategories() => _dio.get(ApiConstants.categories);
  Future<Response> getBrands() => _dio.get(ApiConstants.brands);

  // Cart
  Future<Response> getCart() => _dio.get(ApiConstants.cart);
  Future<Response> addToCart(String medicineId, int quantity) => _dio.post(ApiConstants.cart, data: {'medicineId': medicineId, 'quantity': quantity});
  Future<Response> updateCartItem(String itemId, int quantity) => _dio.patch('${ApiConstants.cart}/$itemId', data: {'quantity': quantity});
  Future<Response> removeFromCart(String itemId) => _dio.delete('${ApiConstants.cart}/$itemId');
  Future<Response> clearCart() => _dio.delete(ApiConstants.cart);
  Future<Response> applyCoupon(String code) => _dio.post('${ApiConstants.cart}/apply-coupon', data: {'code': code});
  Future<Response> removeCoupon() => _dio.delete('${ApiConstants.cart}/remove-coupon');

  // Checkout
  Future<Response> checkout(Map<String, dynamic> data) => _dio.post(ApiConstants.orders, data: data);

  // Orders
  Future<Response> getOrders({String? status, int page = 1, int limit = 20}) => _dio.get(ApiConstants.orders, queryParameters: {'status': status, 'page': page, 'limit': limit});
  Future<Response> getOrderById(String id) => _dio.get(ApiConstants.orderById(id));
  Future<Response> trackOrder(String id) => _dio.get(ApiConstants.orderTracking(id));
  Future<Response> cancelOrder(String id, String reason) => _dio.post(ApiConstants.cancelOrder(id), data: {'reason': reason});

  // Addresses
  Future<Response> getAddresses() => _dio.get(ApiConstants.addresses);
  Future<Response> createAddress(Map<String, dynamic> data) => _dio.post(ApiConstants.addresses, data: data);
  Future<Response> updateAddress(String id, Map<String, dynamic> data) => _dio.patch('${ApiConstants.addresses}/$id', data: data);
  Future<Response> deleteAddress(String id) => _dio.delete('${ApiConstants.addresses}/$id');
  Future<Response> setDefaultAddress(String id) => _dio.patch('${ApiConstants.addresses}/$id/default');

  // Payments
  Future<Response> getPaymentMethods() => _dio.get(ApiConstants.payments);
  Future<Response> addPaymentMethod(Map<String, dynamic> data) => _dio.post(ApiConstants.payments, data: data);
  Future<Response> deletePaymentMethod(String id) => _dio.delete('${ApiConstants.payments}/$id');

  // Coupons
  Future<Response> getCoupons() => _dio.get(ApiConstants.coupons);
  Future<Response> validateCoupon(String code) => _dio.post('${ApiConstants.coupons}/validate', data: {'code': code});

  // Wallet
  Future<Response> getWallet() => _dio.get(ApiConstants.wallet);
  Future<Response> topUpWallet(double amount, Map<String, dynamic> paymentData) => _dio.post('${ApiConstants.wallet}/top-up', data: {'amount': amount, 'payment': paymentData});
  Future<Response> getWalletTransactions({int page = 1, int limit = 20}) => _dio.get('${ApiConstants.wallet}/transactions', queryParameters: {'page': page, 'limit': limit});

  // Loyalty Points
  Future<Response> getLoyaltyPoints() => _dio.get(ApiConstants.loyaltyPoints);
  Future<Response> getLoyaltyHistory({int page = 1, int limit = 20}) => _dio.get('${ApiConstants.loyaltyPoints}/history', queryParameters: {'page': page, 'limit': limit});

  // Reviews
  Future<Response> createReview(String medicineId, double rating, String comment) => _dio.post(ApiConstants.reviews, data: {'medicineId': medicineId, 'rating': rating, 'comment': comment});
  Future<Response> updateReview(String reviewId, double rating, String comment) => _dio.patch('${ApiConstants.reviews}/$reviewId', data: {'rating': rating, 'comment': comment});
  Future<Response> deleteReview(String reviewId) => _dio.delete('${ApiConstants.reviews}/$reviewId');
  Future<Response> getMyReviews({int page = 1, int limit = 20}) => _dio.get('${ApiConstants.reviews}/my', queryParameters: {'page': page, 'limit': limit});

  // Notifications
  Future<Response> getNotifications({int page = 1, int limit = 20}) => _dio.get(ApiConstants.notifications, queryParameters: {'page': page, 'limit': limit});
  Future<Response> markNotificationRead(String id) => _dio.patch('${ApiConstants.notifications}/$id/read');
  Future<Response> markAllNotificationsRead() => _dio.post('${ApiConstants.notifications}/read-all');
  Future<Response> deleteNotification(String id) => _dio.delete('${ApiConstants.notifications}/$id');

  // Referrals
  Future<Response> getReferralCode() => _dio.get(ApiConstants.referrals);
  Future<Response> submitReferralCode(String code) => _dio.post(ApiConstants.referrals, data: {'code': code});
  Future<Response> getReferralHistory({int page = 1, int limit = 20}) => _dio.get('${ApiConstants.referrals}/history', queryParameters: {'page': page, 'limit': limit});

  // Support
  Future<Response> getTickets({int page = 1, int limit = 20}) => _dio.get(ApiConstants.support, queryParameters: {'page': page, 'limit': limit});
  Future<Response> createTicket(Map<String, dynamic> data) => _dio.post(ApiConstants.support, data: data);
  Future<Response> getTicketMessages(String ticketId) => _dio.get('${ApiConstants.support}/$ticketId/messages');
  Future<Response> sendTicketMessage(String ticketId, String message) => _dio.post('${ApiConstants.support}/$ticketId/messages', data: {'message': message});

  // Returns
  Future<Response> getReturns({int page = 1, int limit = 20}) => _dio.get(ApiConstants.returns, queryParameters: {'page': page, 'limit': limit});
  Future<Response> createReturn(Map<String, dynamic> data) => _dio.post(ApiConstants.returns, data: data);
  Future<Response> getReturnById(String id) => _dio.get('${ApiConstants.returns}/$id');

  // Upload
  Future<Response> uploadFile(String filePath) async {
    final file = await MultipartFile.fromFile(filePath);
    return _dio.post(ApiConstants.upload, data: FormData.fromMap({'file': file}));
  }

  // Wishlist
  Future<Response> getWishlist() => _dio.get('/wishlist');
  Future<Response> addToWishlist(String medicineId) => _dio.post('/wishlist', data: {'medicineId': medicineId});
  Future<Response> removeFromWishlist(String medicineId) => _dio.delete('/wishlist/$medicineId');
}

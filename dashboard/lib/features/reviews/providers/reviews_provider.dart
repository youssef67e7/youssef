import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final reviewsProvider = FutureProvider<List<Review>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getReviews();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => Review.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final reviewStatusFilterProvider = StateProvider<String>((ref) => '');

class ReviewsNotifier extends StateNotifier<AsyncValue<List<Review>>> {
  final dynamic _api;
  ReviewsNotifier(this._api) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.getReviews();
      final data = response.data['data'];
      final reviews = data is List
          ? data.map((e) => Review.fromJson(e as Map<String, dynamic>)).toList()
          : <Review>[];
      state = AsyncValue.data(reviews);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> approve(String id) async {
    await _api.approveReview(id);
    await load();
  }

  Future<void> reject(String id) async {
    await _api.rejectReview(id);
    await load();
  }

  Future<void> reply(String id, String reply) async {
    await _api.replyToReview(id, reply);
    await load();
  }
}

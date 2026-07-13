import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';

final reviewsProvider = FutureProvider<List<Review>>((ref) async {
  return List.generate(
    15,
    (i) => Review(
      id: 'REV-${i + 1}',
      customerId: 'C${i + 1}',
      customerName: ['Ahmed Ali', 'Sara Mohammed', 'Omar Hassan', 'Fatima Khan', 'Ali Ibrahim',
          'Nora Salem', 'Khalid Omar', 'Mona Ali', 'Yusuf Ahmed', 'Layla Khan',
          'Hassan Ibrahim', 'Noor Saeed', 'Tariq Nasser', 'Reem Omar', 'Sami Youssef'][i],
      medicineId: 'MED-${(i % 8) + 1}',
      medicineName: ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Vitamin C', 'Cetirizine',
          'Omeprazole', 'Metformin', 'Losartan'][i % 8],
      orderId: 'ORD-${2000 + i}',
      rating: (i % 5) + 1,
      comment: ['Great medicine, works well!', 'Good quality and fast delivery.',
          'As described, recommend.', 'Not effective for me.', 'Excellent product!',
          'Good value for money.', 'Fast shipping, thanks!', 'Average quality.',
          'Very satisfied with the purchase.', 'Will buy again.',
          'Product was damaged on arrival.', 'Perfect, exactly what I needed.',
          'Could be better.', 'Top notch service!', 'Fair product.'][i],
      adminReply: i < 3 ? 'Thank you for your feedback!' : null,
      status: ['approved', 'approved', 'approved', 'pending', 'approved',
          'approved', 'rejected', 'pending', 'approved', 'approved',
          'pending', 'approved', 'pending', 'approved', 'rejected'][i],
      createdAt: DateTime.now().subtract(Duration(days: i * 2)),
    ),
  );
});

final reviewStatusFilterProvider = StateProvider<String>((ref) => '');

class ReviewsPage extends ConsumerWidget {
  const ReviewsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewsAsync = ref.watch(reviewsProvider);
    final statusFilter = ref.watch(reviewStatusFilterProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Reviews',
            subtitle: 'Manage customer reviews',
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Wrap(
                spacing: 8,
                children: [
                  FilterChip(
                    label: const Text('All'),
                    selected: statusFilter.isEmpty,
                    onSelected: (_) => ref.read(reviewStatusFilterProvider.notifier).state = '',
                  ),
                  FilterChip(
                    label: const Text('Pending'),
                    selected: statusFilter == 'pending',
                    onSelected: (_) => ref.read(reviewStatusFilterProvider.notifier).state =
                        statusFilter == 'pending' ? '' : 'pending',
                  ),
                  FilterChip(
                    label: const Text('Approved'),
                    selected: statusFilter == 'approved',
                    onSelected: (_) => ref.read(reviewStatusFilterProvider.notifier).state =
                        statusFilter == 'approved' ? '' : 'approved',
                  ),
                  FilterChip(
                    label: const Text('Rejected'),
                    selected: statusFilter == 'rejected',
                    onSelected: (_) => ref.read(reviewStatusFilterProvider.notifier).state =
                        statusFilter == 'rejected' ? '' : 'rejected',
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          reviewsAsync.when(
            data: (allReviews) {
              var filtered = allReviews;
              if (statusFilter.isNotEmpty) {
                filtered = filtered.where((r) => r.status == statusFilter).toList();
              }

              return Column(
                children: filtered
                    .map(
                      (review) => Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 16,
                                        backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                        child: Text(
                                          (review.customerName ?? 'U')[0].toUpperCase(),
                                          style: TextStyle(color: Theme.of(context).colorScheme.primary),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(review.customerName ?? 'Unknown',
                                              style: const TextStyle(fontWeight: FontWeight.w600)),
                                          Text('Medicine: ${review.medicineName ?? '-'}',
                                              style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Row(
                                    children: [
                                      StatusBadge(status: review.status),
                                      const SizedBox(width: 8),
                                      Text(Formatters.timeAgo(review.createdAt),
                                          style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: List.generate(
                                  5,
                                  (index) => Icon(
                                    index < review.rating ? Icons.star : Icons.star_border,
                                    size: 18,
                                    color: Colors.amber,
                                  ),
                                ),
                              ),
                              if (review.comment != null) ...[
                                const SizedBox(height: 8),
                                Text(review.comment!),
                              ],
                              if (review.adminReply != null) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withOpacity(0.05),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.blue.withOpacity(0.2)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.reply, size: 16, color: Colors.blue),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          'Admin: ${review.adminReply!}',
                                          style: const TextStyle(fontSize: 13),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  if (review.status == 'pending') ...[
                                    ElevatedButton.icon(
                                      onPressed: () {},
                                      icon: const Icon(Icons.check, size: 16),
                                      label: const Text('Approve'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.green,
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton.icon(
                                      onPressed: () {},
                                      icon: const Icon(Icons.close, size: 16),
                                      label: const Text('Reject'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.red,
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                  ],
                                  OutlinedButton.icon(
                                    onPressed: () => _showReplyDialog(context, review),
                                    icon: const Icon(Icons.reply, size: 16),
                                    label: const Text('Reply'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                    .toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }

  void _showReplyDialog(BuildContext context, Review review) {
    final controller = TextEditingController(text: review.adminReply ?? '');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reply to Review'),
        content: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: TextField(
            controller: controller,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Write your reply...',
              border: OutlineInputBorder(),
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reply sent')));
            },
            child: const Text('Send Reply'),
          ),
        ],
      ),
    );
  }
}

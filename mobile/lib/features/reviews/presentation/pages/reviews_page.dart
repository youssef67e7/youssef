import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/star_rating.dart';

class ReviewsPage extends ConsumerStatefulWidget {
  const ReviewsPage({super.key});

  @override
  ConsumerState<ReviewsPage> createState() => _ReviewsPageState();
}

class _ReviewsPageState extends ConsumerState<ReviewsPage> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Reviews')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: EdgeInsets.all(16.r),
                child: Row(
                  children: [
                    Column(
                      children: [
                        Text(
                          '4.5',
                          style: theme.textTheme.headlineLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        StarRating(rating: 4.5, size: 16),
                        SizedBox(height: 4.h),
                        Text(
                          '120 reviews',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                    SizedBox(width: 24.w),
                    Expanded(
                      child: Column(
                        children: [
                          _buildRatingBar(theme, 5, 80),
                          _buildRatingBar(theme, 4, 25),
                          _buildRatingBar(theme, 3, 10),
                          _buildRatingBar(theme, 2, 3),
                          _buildRatingBar(theme, 1, 2),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Customer Reviews',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: _showWriteReview,
                  child: const Text('Write Review'),
                ),
              ],
            ),
            SizedBox(height: 8.h),
            ...List.generate(5, (index) {
              return Card(
                margin: EdgeInsets.only(bottom: 8.h),
                child: Padding(
                  padding: EdgeInsets.all(12.r),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 16.r,
                            child: Text('U${index + 1}'),
                          ),
                          SizedBox(width: 8.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'User ${index + 1}',
                                  style: const TextStyle(fontWeight: FontWeight.w600),
                                ),
                                StarRating(
                                  rating: 5.0 - index * 0.5,
                                  size: 12,
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${index + 1}d ago',
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        'Great product! Works very well and fast delivery. Highly recommended for everyone.',
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingBar(ThemeData theme, int stars, int percentage) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 2.h),
      child: Row(
        children: [
          Text('$stars', style: theme.textTheme.bodySmall),
          SizedBox(width: 4.w),
          Icon(Icons.star, size: 12.r, color: Colors.amber),
          SizedBox(width: 8.w),
          Expanded(
            child: LinearProgressIndicator(
              value: percentage / 100,
              backgroundColor: theme.colorScheme.surfaceContainerHigh,
            ),
          ),
          SizedBox(width: 8.w),
          Text('$percentage%', style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }

  void _showWriteReview() {
    double rating = 4.0;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return Padding(
            padding: EdgeInsets.all(16.r),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Write a Review', style: Theme.of(context).textTheme.titleLarge),
                SizedBox(height: 16.h),
                Text('Your Rating'),
                SizedBox(height: 8.h),
                Row(
                  children: List.generate(5, (index) {
                    return IconButton(
                      icon: Icon(
                        index < rating ? Icons.star : Icons.star_border,
                        color: Colors.amber,
                        size: 32.r,
                      ),
                      onPressed: () {
                        setModalState(() => rating = index + 1.0);
                      },
                    );
                  }),
                ),
                SizedBox(height: 16.h),
                TextField(
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Write your review...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                  ),
                ),
                SizedBox(height: 16.h),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Review submitted!')),
                      );
                    },
                    child: const Text('Submit Review'),
                  ),
                ),
                SizedBox(height: MediaQuery.of(context).viewInsets.bottom),
              ],
            ),
          );
        },
      ),
    );
  }
}

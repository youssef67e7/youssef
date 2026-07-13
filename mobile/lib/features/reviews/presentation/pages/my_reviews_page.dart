import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pharmaworld/shared/widgets/star_rating.dart';
import 'package:pharmaworld/shared/widgets/empty_state.dart';

class MyReviewsPage extends ConsumerWidget {
  const MyReviewsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final reviews = _mockReviews;

    return Scaffold(
      appBar: AppBar(title: const Text('My Reviews')),
      body: reviews.isEmpty
          ? const EmptyState(
              title: 'No reviews yet',
              subtitle: 'Your reviews will appear here',
            )
          : ListView.separated(
              padding: EdgeInsets.all(16.r),
              itemCount: reviews.length,
              separatorBuilder: (_, __) => SizedBox(height: 12.h),
              itemBuilder: (context, index) {
                final r = reviews[index];
                return Card(
                  child: Padding(
                    padding: EdgeInsets.all(16.r),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8.r),
                              child: Container(
                                width: 48.r, height: 48.r,
                                color: theme.colorScheme.primaryContainer,
                                child: Icon(Icons.medication, color: theme.colorScheme.primary),
                              ),
                            ),
                            SizedBox(width: 12.w),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${r['medicine']}', style: theme.textTheme.titleSmall),
                                  SizedBox(height: 4.h),
                                  StarRating(rating: (r['rating'] as num).toDouble(), size: 16.r),
                                ],
                              ),
                            ),
                            Text('${r['date']}', style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
                          ],
                        ),
                        SizedBox(height: 8.h),
                        Text('${r['comment']}', style: theme.textTheme.bodyMedium),
                        SizedBox(height: 8.h),
                        Row(
                          children: [
                            Icon(Icons.favorite, size: 14.r, color: Colors.red.shade300),
                            SizedBox(width: 4.w),
                            Text('${r['likes']}', style: theme.textTheme.bodySmall),
                            SizedBox(width: 16.w),
                            Icon(Icons.edit_outlined, size: 14.r, color: Colors.grey),
                            SizedBox(width: 4.w),
                            Text('Edit', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.primary)),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

final _mockReviews = [
  {'medicine': 'Amoxicillin 500mg', 'rating': 4.5, 'comment': 'Effective antibiotic, works quickly. Mild side effects but overall very good.', 'date': '2 days ago', 'likes': 12},
  {'medicine': 'Paracetamol 650mg', 'rating': 5.0, 'comment': 'Best pain reliever I have used. Highly recommended.', 'date': '1 week ago', 'likes': 8},
  {'medicine': 'Vitamin D 2000IU', 'rating': 3.5, 'comment': 'Good supplement but takes time to show results.', 'date': '2 weeks ago', 'likes': 5},
];

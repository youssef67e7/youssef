import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pharmaworld/shared/widgets/custom_button.dart';
import 'package:pharmaworld/shared/widgets/custom_text_field.dart';

class EditReviewPage extends ConsumerStatefulWidget {
  const EditReviewPage({super.key, required this.reviewId});
  final String reviewId;

  @override
  ConsumerState<EditReviewPage> createState() => _EditReviewPageState();
}

class _EditReviewPageState extends ConsumerState<EditReviewPage> {
  final _commentController = TextEditingController(text: 'Effective antibiotic, works quickly. Mild side effects but overall very good.');
  double _rating = 4.5;
  bool _submitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a rating')),
      );
      return;
    }
    setState(() => _submitting = true);
    await Future.delayed(const Duration(milliseconds: 1000));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Review updated successfully')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Review')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  Icon(Icons.edit_outlined, size: 48.r, color: theme.colorScheme.primary),
                  SizedBox(height: 8.h),
                  Text('Edit your rating', style: theme.textTheme.titleMedium),
                  SizedBox(height: 12.h),
                  _RatingSelector(
                    rating: _rating,
                    onChanged: (v) => setState(() => _rating = v),
                    size: 36.r,
                  ),
                ],
              ),
            ),
            SizedBox(height: 24.h),
            Text('Your Review', style: theme.textTheme.titleSmall),
            SizedBox(height: 8.h),
            CustomTextField(
              controller: _commentController,
              hintText: 'Update your review',
              maxLines: 5,
            ),
            SizedBox(height: 24.h),
            CustomButton(
              text: 'Update Review',
              isLoading: _submitting,
              onPressed: _submit,
            ),
            SizedBox(height: 12.h),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Delete Review'),
                      content: const Text('Are you sure? This cannot be undone.'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
                      ],
                    ),
                  );
                  if (confirm == true && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Review deleted')));
                    Navigator.pop(context);
                  }
                },
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                label: const Text('Delete Review', style: TextStyle(color: Colors.red)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RatingSelector extends StatelessWidget {
  const _RatingSelector({required this.rating, required this.onChanged, this.size = 36});
  final double rating;
  final ValueChanged<double> onChanged;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1.0;
        final filled = starValue <= rating;
        final halfFilled = !filled && starValue - 0.5 <= rating;
        return GestureDetector(
          onTap: () => onChanged(starValue),
          onTapDown: (d) => onChanged(starValue),
          child: Icon(
            filled ? Icons.star : (halfFilled ? Icons.star_half : Icons.star_border),
            size: size.r,
            color: Colors.amber,
          ),
        );
      }),
    );
  }
}

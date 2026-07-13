import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pharmaworld/shared/widgets/custom_button.dart';
import 'package:pharmaworld/shared/widgets/custom_text_field.dart';


class WriteReviewPage extends ConsumerStatefulWidget {
  const WriteReviewPage({super.key, required this.medicineId});
  final String medicineId;

  @override
  ConsumerState<WriteReviewPage> createState() => _WriteReviewPageState();
}

class _WriteReviewPageState extends ConsumerState<WriteReviewPage> {
  final _commentController = TextEditingController();
  double _rating = 0;
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
    if (_commentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please write a review')),
      );
      return;
    }
    setState(() => _submitting = true);
    await Future.delayed(const Duration(milliseconds: 1000));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Review submitted successfully')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Write Review')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  Icon(Icons.rate_review_outlined, size: 48.r, color: theme.colorScheme.primary),
                  SizedBox(height: 8.h),
                  Text('Rate this medicine', style: theme.textTheme.titleMedium),
                  SizedBox(height: 12.h),
                  _RatingSelector(
                    rating: _rating,
                    onChanged: (v) => setState(() => _rating = v),
                    size: 36.r,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    _rating == 0 ? 'Tap to rate' :
                    _rating <= 2 ? 'Poor' : _rating <= 3 ? 'Average' : _rating <= 4 ? 'Good' : 'Excellent',
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.primary),
                  ),
                ],
              ),
            ),
            SizedBox(height: 24.h),
            Text('Your Review', style: theme.textTheme.titleSmall),
            SizedBox(height: 8.h),
            CustomTextField(
              controller: _commentController,
              hintText: 'Share your experience with this medicine',
              maxLines: 5,
              validator: (v) => v?.trim().isEmpty == true ? 'Please write a review' : null,
            ),
            SizedBox(height: 8.h),
            Row(
              children: [
                Icon(Icons.info_outline, size: 14.r, color: Colors.grey),
                SizedBox(width: 4.w),
                Text('Your review will be public', style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
              ],
            ),
            SizedBox(height: 24.h),
            CustomButton(
              text: 'Submit Review',
              isLoading: _submitting,
              onPressed: _submit,
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

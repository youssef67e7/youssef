import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../shared/widgets/medicine_card.dart';

class CategoryDetailPage extends ConsumerWidget {
  final String categoryId;
  const CategoryDetailPage({super.key, required this.categoryId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Category')),
      body: GridView.builder(
        padding: EdgeInsets.all(16.r),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.7,
          crossAxisSpacing: 12.w,
          mainAxisSpacing: 12.h,
        ),
        itemCount: 8,
        itemBuilder: (context, index) {
          return MedicineCard(
            id: '$index',
            name: 'Medicine ${index + 1}',
            imageUrl: 'https://via.placeholder.com/200',
            price: 50.0 + index * 10,
            onTap: () {},
            onAddToCart: () {},
            onToggleWishlist: () {},
          );
        },
      ),
    );
  }
}

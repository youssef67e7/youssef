import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../shared/widgets/category_card.dart';
import '../../../shared/widgets/search_bar.dart';

class CategoriesPage extends ConsumerWidget {
  const CategoriesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Categories'),
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16.r),
            child: const CustomSearchBar(
              hintText: 'Search categories...',
              readOnly: true,
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: EdgeInsets.all(16.r),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 0.85,
                crossAxisSpacing: 12.w,
                mainAxisSpacing: 12.h,
              ),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                return CategoryCard(
                  name: cat['name']!,
                  onTap: () {},
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  static final List<Map<String, String>> _categories = [
    {'name': 'Pain Relief'},
    {'name': 'Vitamins'},
    {'name': 'Antibiotics'},
    {'name': 'Skincare'},
    {'name': 'Heart Care'},
    {'name': 'Diabetes'},
    {'name': 'Respiratory'},
    {'name': 'Digestive'},
    {'name': 'Eye Care'},
    {'name': 'Baby Care'},
    {'name': 'Personal Care'},
    {'name': 'Supplements'},
    {'name': 'Herbal'},
    {'name': 'First Aid'},
    {'name': 'Medical Devices'},
    {'name': 'Weight Management'},
    {'name': 'Sexual Health'},
    {'name': 'Cold & Flu'},
  ];
}

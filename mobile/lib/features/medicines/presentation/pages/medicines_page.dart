import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:pharmaworld/shared/widgets/medicine_card.dart';
import 'package:pharmaworld/shared/widgets/search_bar.dart';

class MedicinesPage extends ConsumerStatefulWidget {
  const MedicinesPage({super.key});

  @override
  ConsumerState<MedicinesPage> createState() => _MedicinesPageState();
}

class _MedicinesPageState extends ConsumerState<MedicinesPage> {
  bool _isGrid = true;
  String _sortBy = 'popularity';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Medicines'),
        actions: [
          IconButton(
            icon: Icon(_isGrid ? Icons.list : Icons.grid_view),
            onPressed: () {
              setState(() {
                _isGrid = !_isGrid;
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.sort),
            onPressed: _showSortOptions,
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterOptions,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16.r),
            child: CustomSearchBar(
              hintText: 'Search medicines...',
              onTap: () => context.push('/medicines/search'),
              readOnly: true,
            ),
          ),
          Expanded(
            child: _isGrid ? _buildGrid() : _buildList(),
          ),
        ],
      ),
    );
  }

  Widget _buildGrid() {
    return GridView.builder(
      padding: EdgeInsets.all(16.r),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        crossAxisSpacing: 12.w,
        mainAxisSpacing: 12.h,
      ),
      itemCount: 10,
      itemBuilder: (context, index) {
        return MedicineCard(
          id: '$index',
          name: 'Medicine ${index + 1}',
          imageUrl: 'https://via.placeholder.com/200',
          price: 50.0 + index * 15,
          originalPrice: index % 3 == 0 ? 100.0 + index * 15 : null,
          rating: 3.5 + (index % 4) * 0.4,
          reviewCount: 5 + index * 3,
          onTap: () {},
          onAddToCart: () {},
          onToggleWishlist: () {},
        );
      },
    );
  }

  Widget _buildList() {
    return ListView.builder(
      padding: EdgeInsets.all(16.r),
      itemCount: 10,
      itemBuilder: (context, index) {
        return Card(
          margin: EdgeInsets.only(bottom: 8.h),
          child: ListTile(
            leading: Container(
              width: 60.w,
              height: 60.h,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Icon(
                Icons.medication,
                color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
              ),
            ),
            title: Text('Medicine ${index + 1}'),
            subtitle: Text('E£${(50.0 + index * 15).toStringAsFixed(2)}'),
            trailing: IconButton(
              icon: const Icon(Icons.add_shopping_cart),
              onPressed: () {},
            ),
          ),
        );
      },
    );
  }

  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: EdgeInsets.all(16.r),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Sort By', style: Theme.of(context).textTheme.titleLarge),
            SizedBox(height: 16.h),
            _buildSortOption('Popularity', 'popularity'),
            _buildSortOption('Price: Low to High', 'price_asc'),
            _buildSortOption('Price: High to Low', 'price_desc'),
            _buildSortOption('Newest', 'newest'),
            _buildSortOption('Rating', 'rating'),
          ],
        ),
      ),
    );
  }

  Widget _buildSortOption(String label, String value) {
    return RadioListTile<String>(
      title: Text(label),
      value: value,
      groupValue: _sortBy,
      onChanged: (value) {
        setState(() {
          _sortBy = value!;
        });
        Navigator.pop(context);
      },
    );
  }

  void _showFilterOptions() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) {
          return SingleChildScrollView(
            controller: scrollController,
            padding: EdgeInsets.all(16.r),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Filter', style: Theme.of(context).textTheme.titleLarge),
                SizedBox(height: 16.h),
                Text('Category', style: Theme.of(context).textTheme.titleMedium),
                SizedBox(height: 8.h),
                Wrap(
                  spacing: 8.w,
                  runSpacing: 8.h,
                  children: ['Pain Relief', 'Vitamins', 'Antibiotics', 'Skincare']
                      .map((cat) => FilterChip(
                            label: Text(cat),
                            onSelected: (_) {},
                          ))
                      .toList(),
                ),
                SizedBox(height: 16.h),
                Text('Price Range', style: Theme.of(context).textTheme.titleMedium),
                RangeSlider(
                  values: const RangeValues(0, 500),
                  max: 500,
                  divisions: 10,
                  labels: const RangeLabels('E£0', 'E£500'),
                  onChanged: (_) {},
                ),
                SizedBox(height: 24.h),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Apply Filter'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

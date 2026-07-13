import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:pharmaworld/shared/widgets/search_bar.dart';

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final _searchController = TextEditingController();
  final List<String> _recentSearches = [
    'Panadol',
    'Vitamin C',
    'Antibiotic',
    'Insulin',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: CustomSearchBar(
          hintText: 'Search medicines...',
          controller: _searchController,
          autofocus: true,
          onChanged: (value) {},
          suffix: TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.all(16.r),
        children: [
          if (_searchController.text.isEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Searches',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('Clear'),
                ),
              ],
            ),
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: _recentSearches.map((search) {
                return Chip(
                  label: Text(search),
                  onDeleted: () {},
                  deleteIcon: const Icon(Icons.close, size: 16),
                );
              }).toList(),
            ),
            SizedBox(height: 24.h),
            Text(
              'Trending Searches',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8.h),
            ...List.generate(5, (index) {
              return ListTile(
                leading: Icon(
                  Icons.trending_up,
                  color: theme.colorScheme.primary,
                ),
                title: Text('Trending item ${index + 1}'),
                trailing: Icon(
                  Icons.arrow_forward_ios,
                  size: 16.r,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                onTap: () {},
              );
            }),
          ] else ...[
            ...List.generate(10, (index) {
              return ListTile(
                leading: Icon(
                  Icons.medication_outlined,
                  color: theme.colorScheme.primary,
                ),
                title: Text('Search result ${index + 1}'),
                subtitle: Text('E£${(30 + index * 10).toStringAsFixed(2)}'),
                trailing: Icon(
                  Icons.arrow_forward_ios,
                  size: 16.r,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                onTap: () {},
              );
            }),
          ],
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../core/constants/app_sizes.dart';

class FilterBottomSheet extends StatelessWidget {
  final Map<String, List<String>> filters;
  final Map<String, dynamic> selectedFilters;
  final ValueChanged<Map<String, dynamic>> onApply;
  final VoidCallback? onReset;

  const FilterBottomSheet({
    super.key,
    required this.filters,
    required this.selectedFilters,
    required this.onApply,
    this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localSelected = Map<String, dynamic>.from(selectedFilters);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      padding: EdgeInsets.all(AppSizes.paddingLarge.r),
      child: StatefulBuilder(
        builder: (context, setModalState) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Filter',
                    style: theme.textTheme.headlineSmall,
                  ),
                  if (onReset != null)
                    TextButton(
                      onPressed: () {
                        setModalState(() {
                          localSelected.clear();
                        });
                        onReset?.call();
                      },
                      child: const Text('Reset'),
                    ),
                ],
              ),
              SizedBox(height: AppSizes.spacingMedium.h),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: filters.length,
                  itemBuilder: (context, index) {
                    final filterName = filters.keys.elementAt(index);
                    final filterOptions = filters[filterName]!;
                    final selectedValues = localSelected[filterName] ?? [];

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: AppSizes.spacingSmall.h),
                        Text(
                          filterName,
                          style: theme.textTheme.titleMedium,
                        ),
                        SizedBox(height: AppSizes.spacingExtraSmall.h),
                        Wrap(
                          spacing: 8.w,
                          runSpacing: 8.h,
                          children: filterOptions.map((option) {
                            final isSelected =
                                (selectedValues as List).contains(option);
                            return FilterChip(
                              label: Text(option),
                              selected: isSelected,
                              onSelected: (selected) {
                                setModalState(() {
                                  final current = List<String>.from(
                                    (localSelected[filterName] ?? []) as List,
                                  );
                                  if (selected) {
                                    current.add(option);
                                  } else {
                                    current.remove(option);
                                  }
                                  localSelected[filterName] = current;
                                });
                              },
                            );
                          }).toList(),
                        ),
                        SizedBox(height: AppSizes.spacingSmall.h),
                      ],
                    );
                  },
                ),
              ),
              SizedBox(height: AppSizes.spacingMedium.h),
              SizedBox(
                width: double.infinity,
                height: AppSizes.buttonHeight,
                child: ElevatedButton(
                  onPressed: () {
                    onApply(localSelected);
                    Navigator.of(context).pop();
                  },
                  child: const Text('Apply Filter'),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

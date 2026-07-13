import 'package:flutter/material.dart';

class FilterChipGroup extends StatelessWidget {
  final List<String> options;
  final String selected;
  final ValueChanged<String> onSelected;
  final bool showAll;
  final String allLabel;

  const FilterChipGroup({
    super.key,
    required this.options,
    required this.selected,
    required this.onSelected,
    this.showAll = true,
    this.allLabel = 'All',
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 4,
      children: [
        if (showAll)
          FilterChip(
            label: Text(allLabel),
            selected: selected.isEmpty,
            onSelected: (_) => onSelected(''),
          ),
        ...options.map(
          (option) => FilterChip(
            label: Text(option),
            selected: selected == option,
            onSelected: (_) => onSelected(selected == option ? '' : option),
          ),
        ),
      ],
    );
  }
}

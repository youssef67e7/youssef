import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../core/constants/app_sizes.dart';
import '../../core/utils/debouncer.dart';

class CustomSearchBar extends StatefulWidget {
  final String? hintText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final VoidCallback? onFilterPressed;
  final TextEditingController? controller;
  final bool readOnly;
  final bool autofocus;
  final Widget? prefix;
  final Widget? suffix;

  const CustomSearchBar({
    super.key,
    this.hintText,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.onFilterPressed,
    this.controller,
    this.readOnly = false,
    this.autofocus = false,
    this.prefix,
    this.suffix,
  });

  @override
  State<CustomSearchBar> createState() => _CustomSearchBarState();
}

class _CustomSearchBarState extends State<CustomSearchBar> {
  late TextEditingController _controller;
  final _debouncer = Debouncer();

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    }
    _debouncer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: 48.h,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Padding(
            padding: EdgeInsets.only(left: 12.w),
            child: widget.prefix ??
                Icon(
                  Icons.search,
                  size: 20.r,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
          ),
          Expanded(
            child: TextField(
              controller: _controller,
              readOnly: widget.readOnly,
              autofocus: widget.autofocus,
              onTap: widget.onTap,
              onChanged: (value) {
                _debouncer.run(() {
                  widget.onChanged?.call(value);
                });
              },
              onSubmitted: widget.onSubmitted,
              style: theme.textTheme.bodyLarge,
              decoration: InputDecoration(
                hintText: widget.hintText ?? 'Search medicines...',
                hintStyle: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 12.w,
                  vertical: 12.h,
                ),
              ),
            ),
          ),
          if (_controller.text.isNotEmpty && widget.controller == null)
            IconButton(
              icon: Icon(
                Icons.close,
                size: 18.r,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              onPressed: () {
                _controller.clear();
                widget.onChanged?.call('');
              },
            ),
          if (widget.onFilterPressed != null)
            IconButton(
              icon: Icon(
                Icons.filter_list,
                size: 20.r,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              onPressed: widget.onFilterPressed,
            ),
          if (widget.suffix != null) widget.suffix!,
        ],
      ),
    );
  }
}

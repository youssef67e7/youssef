import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SidebarItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;
  final bool isSelected;
  final bool isCollapsed;

  const SidebarItem({
    super.key,
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.route,
    this.isSelected = false,
    this.isCollapsed = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isSelected
        ? Theme.of(context).colorScheme.primary
        : Theme.of(context).brightness == Brightness.dark
            ? Colors.white70
            : Colors.black54;

    return Tooltip(
      message: isCollapsed ? label : '',
      child: ListTile(
        leading: Icon(
          isSelected ? activeIcon : icon,
          color: color,
          size: 22,
        ),
        title: isCollapsed
            ? null
            : Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: color,
                ),
              ),
        selected: isSelected,
        contentPadding: isCollapsed
            ? const EdgeInsets.symmetric(horizontal: 0)
            : const EdgeInsets.symmetric(horizontal: 12),
        visualDensity: const VisualDensity(vertical: -1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        onTap: () => context.go(route),
      ),
    );
  }
}

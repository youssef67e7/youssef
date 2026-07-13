import 'package:flutter/material.dart';

class BulkActionBar extends StatelessWidget {
  final int selectedCount;
  final VoidCallback? onDelete;
  final VoidCallback? onActivate;
  final VoidCallback? onDeactivate;
  final VoidCallback? onClearSelection;
  final List<Widget>? additionalActions;

  const BulkActionBar({
    super.key,
    required this.selectedCount,
    this.onDelete,
    this.onActivate,
    this.onDeactivate,
    this.onClearSelection,
    this.additionalActions,
  });

  @override
  Widget build(BuildContext context) {
    if (selectedCount == 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Text(
            '$selectedCount item(s) selected',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          const Spacer(),
          if (onActivate != null)
            TextButton.icon(
              onPressed: onActivate,
              icon: const Icon(Icons.check_circle_outline, size: 18),
              label: const Text('Activate'),
            ),
          if (onDeactivate != null)
            TextButton.icon(
              onPressed: onDeactivate,
              icon: const Icon(Icons.cancel_outlined, size: 18),
              label: const Text('Deactivate'),
            ),
          if (onDelete != null)
            TextButton.icon(
              onPressed: onDelete,
              icon: Icon(Icons.delete_outline, size: 18, color: Colors.red.shade400),
              label: Text('Delete', style: TextStyle(color: Colors.red.shade400)),
            ),
          if (additionalActions != null) ...additionalActions!,
          const SizedBox(width: 8),
          IconButton(
            onPressed: onClearSelection,
            icon: const Icon(Icons.close, size: 18),
            tooltip: 'Clear selection',
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';

class StatusIndicator extends StatelessWidget {
  final String status;
  final String? label;
  final double size;
  final bool showLabel;

  const StatusIndicator({
    super.key,
    required this.status,
    this.label,
    this.size = 10,
    this.showLabel = true,
  });

  @override
  Widget build(BuildContext context) {
    final color = AppColors.getStatusColor(status);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(color: color.withValues(alpha: 0.4), blurRadius: 4, offset: const Offset(0, 2)),
            ],
          ),
        ),
        if (showLabel) ...[
          const SizedBox(width: 8),
          Text(
            label ?? status.toUpperCase(),
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/core/utils/formatters.dart';

class EarningsCard extends StatelessWidget {
  final String title;
  final double amount;
  final int? deliveries;
  final Color color;
  final IconData icon;
  final bool isCompact;

  const EarningsCard({
    super.key,
    required this.title,
    required this.amount,
    this.deliveries,
    required this.color,
    required this.icon,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        padding: EdgeInsets.all(isCompact ? 12 : 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              color.withOpacity(0.1),
              color.withOpacity(0.05),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: color, size: isCompact ? 16 : 20),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: isCompact ? 12 : 14,
                      color: Colors.grey[600],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            SizedBox(height: isCompact ? 8 : 12),
            Text(
              Formatters.formatCurrency(amount),
              style: TextStyle(
                fontSize: isCompact ? 20 : 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            if (deliveries != null) ...[
              const SizedBox(height: 4),
              Text(
                '$deliveries deliveries',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

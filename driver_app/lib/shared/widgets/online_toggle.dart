import 'package:flutter/material.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';

class OnlineToggle extends StatelessWidget {
  final bool isOnline;
  final VoidCallback onToggle;

  const OnlineToggle({
    super.key,
    required this.isOnline,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isOnline ? AppColors.online : AppColors.offline,
                boxShadow: [
                  BoxShadow(
                    color: (isOnline ? AppColors.online : AppColors.offline)
                        .withOpacity(0.4),
                    blurRadius: 8,
                    spreadRadius: 2,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isOnline ? 'Online' : 'Offline',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: isOnline ? AppColors.online : AppColors.offline,
                    ),
                  ),
                  Text(
                    isOnline
                        ? 'You are accepting deliveries'
                        : 'Go online to receive deliveries',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Switch(
              value: isOnline,
              onChanged: (_) => onToggle(),
              activeColor: AppColors.online,
              activeTrackColor: AppColors.online.withOpacity(0.3),
            ),
          ],
        ),
      ),
    );
  }
}

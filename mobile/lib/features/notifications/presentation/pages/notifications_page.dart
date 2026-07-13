import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../shared/widgets/empty_state.dart';

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  final List<Map<String, dynamic>> _notifications = [
    {
      'id': '1',
      'title': 'Order Confirmed',
      'message': 'Your order #PW2024001 has been confirmed.',
      'time': '2 hours ago',
      'isRead': false,
      'icon': Icons.check_circle,
      'color': Colors.green,
    },
    {
      'id': '2',
      'title': 'Special Offer',
      'message': 'Get 30% off on all vitamins this week!',
      'time': '5 hours ago',
      'isRead': false,
      'icon': Icons.local_offer,
      'color': Colors.orange,
    },
    {
      'id': '3',
      'title': 'Delivery Update',
      'message': 'Your order is out for delivery.',
      'time': '1 day ago',
      'isRead': true,
      'icon': Icons.local_shipping,
      'color': Colors.blue,
    },
    {
      'id': '4',
      'title': 'Welcome!',
      'message': 'Welcome to PharmaWorld. Start shopping now!',
      'time': '2 days ago',
      'isRead': true,
      'icon': Icons.waving_hand,
      'color': Colors.purple,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_notifications.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Notifications')),
        body: const EmptyState(
          type: EmptyStateType.noNotifications,
          title: 'No notifications',
          subtitle: 'You will receive notifications about your orders and offers',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                for (var n in _notifications) {
                  n['isRead'] = true;
                }
              });
            },
            child: const Text('Mark all read'),
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: _notifications.length,
        itemBuilder: (context, index) {
          final notification = _notifications[index];
          return ListTile(
            leading: Container(
              width: 44.r,
              height: 44.r,
              decoration: BoxDecoration(
                color: (notification['color'] as Color).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                notification['icon'],
                color: notification['color'],
                size: 22.r,
              ),
            ),
            title: Text(
              notification['title'],
              style: TextStyle(
                fontWeight:
                    notification['isRead'] ? FontWeight.normal : FontWeight.bold,
              ),
            ),
            subtitle: Text(notification['message']),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  notification['time'],
                  style: theme.textTheme.labelSmall,
                ),
                if (!notification['isRead'])
                  Container(
                    margin: EdgeInsets.only(top: 4.h),
                    width: 8.r,
                    height: 8.r,
                    decoration: const BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
            onTap: () {
              setState(() {
                notification['isRead'] = true;
              });
            },
          );
        },
      ),
    );
  }
}

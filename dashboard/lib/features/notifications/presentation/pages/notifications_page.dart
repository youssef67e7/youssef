import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';

final notificationsProvider = FutureProvider<List<NotificationModel>>((ref) async {
  return List.generate(
    10,
    (i) => NotificationModel(
      id: 'NTF-${i + 1}',
      title: ['Order Confirmed', 'Delivery Update', 'New Offer Available', 'Payment Received',
          'Account Suspended', 'Promotion', 'System Update', 'Welcome Message',
          'Refund Processed', 'Review Reminder'][i],
      body: ['Your order #${2000 + i} has been confirmed.', 'Driver is on the way.',
          'Check out our new summer sale!', 'Payment of \$${(i + 1) * 50} received.',
          'Your account has been suspended.', 'Enjoy 20% off all medicines.',
          'System maintenance scheduled.', 'Welcome to PharmaWorld!',
          'Your refund has been processed.', 'Rate your recent purchase.'][i],
      targetType: i % 3 == 0 ? 'all' : 'specific',
      sentCount: i % 3 == 0 ? 1250 : 150 + i * 20,
      readCount: (i % 3 == 0 ? 800 : 100 + i * 15),
      status: 'sent',
      createdAt: DateTime.now().subtract(Duration(days: i * 3)),
    ),
  );
});

final notificationTabProvider = StateProvider<int>((ref) => 0);

class NotificationsPage extends ConsumerWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);
    final activeTab = ref.watch(notificationTabProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Notifications',
            subtitle: 'Send and manage notifications',
            actions: [
              ElevatedButton.icon(
                onPressed: () => _showSendNotificationDialog(context),
                icon: const Icon(Icons.send, size: 18),
                label: const Text('Send Notification'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  ChoiceChip(
                    label: const Text('History'),
                    selected: activeTab == 0,
                    onSelected: (_) => ref.read(notificationTabProvider.notifier).state = 0,
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    label: const Text('Send New'),
                    selected: activeTab == 1,
                    onSelected: (_) => ref.read(notificationTabProvider.notifier).state = 1,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (activeTab == 0)
            notificationsAsync.when(
              data: (notifications) => Card(
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: notifications.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final notification = notifications[index];
                    return ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.notifications_outlined,
                          color: Theme.of(context).colorScheme.primary,
                          size: 20,
                        ),
                      ),
                      title: Text(notification.title, style: const TextStyle(fontWeight: FontWeight.w500)),
                      subtitle: Text(notification.body, maxLines: 1, overflow: TextOverflow.ellipsis),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(Formatters.timeAgo(notification.createdAt),
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                          const SizedBox(height: 4),
                          Text('${notification.sentCount} sent',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                        ],
                      ),
                    );
                  },
                ),
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            )
          else
            _buildSendNotificationForm(context),
        ],
      ),
    );
  }

  Widget _buildSendNotificationForm(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const TextFormField(decoration: InputDecoration(labelText: 'Title')),
              const SizedBox(height: 16),
              const TextFormField(
                decoration: InputDecoration(labelText: 'Body'),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Target Audience'),
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All Users')),
                  DropdownMenuItem(value: 'specific', child: Text('Specific Users')),
                  DropdownMenuItem(value: 'segment', child: Text('User Segment')),
                ],
                onChanged: (v) {},
              ),
              const SizedBox(height: 16),
              const TextFormField(decoration: InputDecoration(labelText: 'Image URL (optional)')),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Notification sent successfully')),
                    );
                  },
                  icon: const Icon(Icons.send, size: 18),
                  label: const Text('Send Notification'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSendNotificationDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Send Notification'),
        content: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const TextFormField(decoration: InputDecoration(labelText: 'Title')),
              const SizedBox(height: 12),
              const TextFormField(decoration: InputDecoration(labelText: 'Body'), maxLines: 3),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Target'),
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All Users')),
                  DropdownMenuItem(value: 'specific', child: Text('Specific Users')),
                ],
                onChanged: (v) {},
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notification sent')),
              );
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }
}

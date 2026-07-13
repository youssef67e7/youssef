import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';
import 'package:pharmaworld_dashboard/features/notifications/providers/notifications_provider.dart';

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
                onPressed: () => _showSendNotificationDialog(context, ref),
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
                          color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
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
            _buildSendNotificationForm(context, ref),
        ],
      ),
    );
  }

  Widget _buildSendNotificationForm(BuildContext context, WidgetRef ref) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(decoration: const InputDecoration(labelText: 'Title')),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Body'),
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
              TextFormField(decoration: const InputDecoration(labelText: 'Image URL (optional)')),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    try {
                      final api = ref.read(apiServiceProvider);
                      await api.sendNotification({
                        'title': 'New Notification',
                        'body': 'Notification body',
                        'targetType': 'all',
                      });
                      ref.invalidate(notificationsProvider);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Notification sent successfully')),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error: $e')),
                        );
                      }
                    }
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

  void _showSendNotificationDialog(BuildContext context, WidgetRef ref) {
    final titleController = TextEditingController();
    final bodyController = TextEditingController();
    String targetType = 'all';
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Send Notification'),
          content: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
                const SizedBox(height: 12),
                TextFormField(controller: bodyController, decoration: const InputDecoration(labelText: 'Body'), maxLines: 3),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'Target'),
                  value: targetType,
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('All Users')),
                    DropdownMenuItem(value: 'specific', child: Text('Specific Users')),
                  ],
                  onChanged: (v) => setState(() => targetType = v ?? 'all'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                try {
                  final api = ref.read(apiServiceProvider);
                  await api.sendNotification({
                    'title': titleController.text,
                    'body': bodyController.text,
                    'targetType': targetType,
                  });
                  ref.invalidate(notificationsProvider);
                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Notification sent')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: $e')),
                    );
                  }
                }
              },
              child: const Text('Send'),
            ),
          ],
        ),
      ),
    );
  }
}

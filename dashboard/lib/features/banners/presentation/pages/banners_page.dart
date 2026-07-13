import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/features/banners/providers/banners_provider.dart';

class BannersPage extends ConsumerWidget {
  const BannersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bannersAsync = ref.watch(bannersProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Banners',
            subtitle: 'Manage homepage banners',
            actions: [
              ElevatedButton.icon(
                onPressed: () async {
                  try {
                    final api = ref.read(apiServiceProvider);
                    await api.createBanner({'title': 'New Banner'});
                                            ref.invalidate(bannersProvider);
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error: $e')),
                      );
                    }
                  }
                },
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Banner'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          bannersAsync.when(
            data: (banners) => Wrap(
              spacing: 16,
              runSpacing: 16,
              children: banners
                  .map(
                    (banner) => SizedBox(
                      width: 350,
                      child: Card(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              height: 150,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: isDark ? Colors.white10 : Colors.grey.shade200,
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                              ),
                              child: const Center(
                                child: Icon(Icons.image_outlined, size: 48, color: Colors.grey),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          banner.title,
                                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                                        ),
                                      ),
                                      StatusBadge(status: banner.isActive ? 'active' : 'inactive'),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text('Order: ${banner.sortOrder}'),
                                  if (banner.link != null)
                                    Text('Link: ${banner.link}', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.drag_handle, size: 18),
                                        tooltip: 'Reorder',
                                        onPressed: () {},
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.edit_outlined, size: 18),
                                        onPressed: () {},
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.visibility_outlined, size: 18),
                                        onPressed: () {},
                                      ),
                                      IconButton(
                                        icon: Icon(Icons.delete_outline, size: 18, color: Colors.red.shade400),
                                        onPressed: () async {
                                          try {
                                            final api = ref.read(apiServiceProvider);
                                            await api.deleteBanner(banner.id);
                    ref.invalidate(bannersProvider);
                                            if (context.mounted) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(content: Text('Banner deleted')),
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
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }
}

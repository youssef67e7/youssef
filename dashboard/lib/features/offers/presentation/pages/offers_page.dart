import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';

final offersProvider = FutureProvider<List<Offer>>((ref) async {
  return List.generate(
    8,
    (i) => Offer(
      id: 'OFF-${i + 1}',
      title: ['Summer Sale', 'Health Week', 'New User Bonus', 'VIP Exclusive',
          'Flash Friday', 'Monthly Deal', 'Clearance Sale', 'Holiday Special'][i],
      titleAr: ['عرض الصيف', 'أسبوع الصحة', 'مميز مستخدم جديد', 'عرض VIP',
          'عرض الجمعة', 'عرض الشهر', 'تخفيضات', 'عرض الأعياد'][i],
      description: ['Up to 30% off', '15% on health products', '20% first order',
          '30% for VIP members', '50% on selected items', '10% all items',
          'Up to 40% off', '25% holiday discount'][i],
      type: 'percentage',
      discountValue: [30, 15, 20, 30, 50, 10, 40, 25][i].toDouble(),
      isActive: i != 6,
      isScheduled: i >= 6,
      startDate: i >= 6 ? DateTime.now().add(Duration(days: i * 5)) : null,
      endDate: i >= 6 ? DateTime.now().add(Duration(days: i * 5 + 14)) : null,
      createdAt: DateTime.now().subtract(Duration(days: 30 - i * 3)),
    ),
  );
});

class OffersPage extends ConsumerWidget {
  const OffersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offersAsync = ref.watch(offersProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Offers',
            subtitle: 'Manage promotional offers',
            actions: [
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Offer'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          offersAsync.when(
            data: (offers) => Card(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: 900,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Offer')),
                      DataColumn(label: Text('Discount')),
                      DataColumn(label: Text('Schedule')),
                      DataColumn(label: Text('Status')),
                      DataColumn(label: Text('Actions')),
                    ],
                    rows: offers
                        .map(
                          (offer) => DataRow(cells: [
                            DataCell(
                              Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(offer.displayTitle, style: const TextStyle(fontWeight: FontWeight.w500)),
                                  Text(offer.description ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                                ],
                              ),
                            ),
                            DataCell(Text('${offer.discountValue?.toInt()}%')),
                            DataCell(Text(offer.isScheduled
                                ? '${Formatters.formatDate(offer.startDate!)} - ${Formatters.formatDate(offer.endDate!)}'
                                : 'Ongoing')),
                            DataCell(StatusBadge(status: offer.isActive ? 'active' : 'inactive')),
                            DataCell(
                              PopupMenuButton<String>(
                                itemBuilder: (context) => [
                                  const PopupMenuItem(value: 'edit', child: Text('Edit')),
                                  const PopupMenuItem(value: 'toggle', child: Text('Toggle Active')),
                                  const PopupMenuItem(value: 'delete', child: Text('Delete')),
                                ],
                                onSelected: (v) {},
                              ),
                            ),
                          ]),
                        )
                        .toList(),
                  ),
                ),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';
import 'package:pharmaworld_dashboard/features/offers/providers/offers_provider.dart';

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
                onPressed: () async {
                  try {
                    final api = ref.read(apiServiceProvider);
                    await api.createOffer({'title': 'New Offer', 'type': 'percentage'});
                    ref.invalidate(offersProvider);
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error: $e')),
                      );
                    }
                  }
                },
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
                                onSelected: (value) async {
                                  try {
                                    final api = ref.read(apiServiceProvider);
                                    if (value == 'toggle') {
                                      await api.updateOffer(offer.id, {'isActive': !offer.isActive});
                                    } else if (value == 'delete') {
                                      await api.deleteOffer(offer.id);
                                    }
                                    ref.invalidate(offersProvider);
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Offer $value')),
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

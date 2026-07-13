import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';
import 'package:pharmaworld_dashboard/features/coupons/providers/coupons_provider.dart';

class CouponsPage extends ConsumerWidget {
  const CouponsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final couponsAsync = ref.watch(couponsProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Coupons',
            subtitle: 'Manage discount coupons',
            actions: [
              ElevatedButton.icon(
                onPressed: () => _showAddCouponDialog(context, ref),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Coupon'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          couponsAsync.when(
            data: (coupons) => Card(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: 1000,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Code')),
                      DataColumn(label: Text('Description')),
                      DataColumn(label: Text('Discount')),
                      DataColumn(label: Text('Min Order'), numeric: true),
                      DataColumn(label: Text('Usage')),
                      DataColumn(label: Text('Valid Until')),
                      DataColumn(label: Text('Status')),
                      DataColumn(label: Text('Actions')),
                    ],
                    rows: coupons
                        .map(
                          (coupon) => DataRow(cells: [
                            DataCell(
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  coupon.code,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: Theme.of(context).colorScheme.primary,
                                  ),
                                ),
                              ),
                            ),
                            DataCell(Text(coupon.description, maxLines: 1, overflow: TextOverflow.ellipsis)),
                            DataCell(Text(
                              coupon.discountType == 'percentage'
                                  ? '${coupon.discountValue.toInt()}%'
                                  : Formatters.formatCurrency(coupon.discountValue),
                            )),
                            DataCell(Text(Formatters.formatCurrency(coupon.minimumOrder ?? 0))),
                            DataCell(Text('${coupon.currentUsage}/${coupon.maxUsage ?? "∞"}')),
                            DataCell(Text(Formatters.formatDate(coupon.validTo))),
                            DataCell(StatusBadge(
                              status: coupon.isActive && !coupon.isExpired ? 'active' : 'inactive',
                            )),
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
                                      await api.updateCoupon(coupon.id, {'isActive': !coupon.isActive});
                                    } else if (value == 'delete') {
                                      await api.deleteCoupon(coupon.id);
                                    }
                                    ref.invalidate(couponsProvider);
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Coupon $value')),
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

  void _showAddCouponDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Coupon'),
        content: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(decoration: const InputDecoration(labelText: 'Coupon Code')),
                const SizedBox(height: 12),
                TextFormField(decoration: const InputDecoration(labelText: 'Description')),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'Discount Type'),
                  items: const [
                    DropdownMenuItem(value: 'percentage', child: Text('Percentage')),
                    DropdownMenuItem(value: 'fixed', child: Text('Fixed Amount')),
                  ],
                  onChanged: (v) {},
                ),
                const SizedBox(height: 12),
                TextFormField(decoration: const InputDecoration(labelText: 'Discount Value'), keyboardType: TextInputType.number),
                const SizedBox(height: 12),
                TextFormField(decoration: const InputDecoration(labelText: 'Minimum Order'), keyboardType: TextInputType.number),
                const SizedBox(height: 12),
                TextFormField(decoration: const InputDecoration(labelText: 'Max Usage'), keyboardType: TextInputType.number),
                const SizedBox(height: 12),
                TextFormField(decoration: const InputDecoration(labelText: 'Valid From'), readOnly: true),
                const SizedBox(height: 12),
                TextFormField(decoration: const InputDecoration(labelText: 'Valid To'), readOnly: true),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              try {
                final api = ref.read(apiServiceProvider);
                await api.createCoupon({'code': 'NEWCOUPON'});
                ref.invalidate(couponsProvider);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Coupon created')));
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

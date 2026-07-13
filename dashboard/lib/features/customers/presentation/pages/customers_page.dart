import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/export_button.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';
import 'package:pharmaworld_dashboard/features/customers/providers/customers_provider.dart';

class CustomersPage extends ConsumerWidget {
  const CustomersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customersAsync = ref.watch(customersProvider);
    final searchQuery = ref.watch(customerSearchProvider);
    final currentPage = ref.watch(customerPageProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Customers',
            subtitle: 'Manage customer accounts',
            actions: [
              ExportButton(
                fileName: 'customers',
                headers: ['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Status'],
                data: [],
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSearchBar(context, ref),
          const SizedBox(height: 16),
          customersAsync.when(
            data: (allCustomers) {
              var filtered = allCustomers;
              if (searchQuery.isNotEmpty) {
                filtered = filtered
                    .where((c) =>
                        c.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
                        c.email.toLowerCase().contains(searchQuery.toLowerCase()) ||
                        c.phone.contains(searchQuery))
                    .toList();
              }

              final totalPages = (filtered.length / 10).ceil();
              final paged = filtered.skip((currentPage - 1) * 10).take(10).toList();

              return Card(
                child: Column(
                  children: [
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: SizedBox(
                        width: 1000,
                        child: DataTable(
                          columns: const [
                            DataColumn(label: Text('Customer')),
                            DataColumn(label: Text('Phone')),
                            DataColumn(label: Text('Orders'), numeric: true),
                            DataColumn(label: Text('Total Spent'), numeric: true),
                            DataColumn(label: Text('Status')),
                            DataColumn(label: Text('Last Order')),
                            DataColumn(label: Text('Actions')),
                          ],
                          rows: paged
                              .map(
                                (customer) => DataRow(cells: [
                                  DataCell(
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        CircleAvatar(
                                          radius: 16,
                                          backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                          child: Text(customer.initials, style: TextStyle(
                                            fontSize: 12, color: Theme.of(context).colorScheme.primary,
                                          )),
                                        ),
                                        const SizedBox(width: 12),
                                        Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(customer.name, style: const TextStyle(fontWeight: FontWeight.w500)),
                                            Text(customer.email, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  DataCell(Text(customer.phone)),
                                  DataCell(Text(customer.totalOrders.toString())),
                                  DataCell(Text(Formatters.formatCurrency(customer.totalSpent))),
                                  DataCell(
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: (customer.isBlocked ? Colors.red : Colors.green).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        customer.isBlocked ? 'Blocked' : 'Active',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: customer.isBlocked ? Colors.red : Colors.green,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                  ),
                                  DataCell(Text(
                                    customer.lastOrderAt != null ? Formatters.timeAgo(customer.lastOrderAt!) : 'Never',
                                  )),
                                  DataCell(
                                    PopupMenuButton<String>(
                                      itemBuilder: (context) => [
                                        const PopupMenuItem(value: 'view', child: Text('View Details')),
                                        const PopupMenuItem(value: 'orders', child: Text('View Orders')),
                                        PopupMenuItem(
                                          value: 'block',
                                          child: Text(customer.isBlocked ? 'Unblock' : 'Block',
                                              style: TextStyle(color: customer.isBlocked ? Colors.green : Colors.red)),
                                        ),
                                      ],
                                      onSelected: (value) async {
                                        if (value == 'block') {
                                          try {
                                            final api = ref.read(apiServiceProvider);
                                            await api.toggleBlockCustomer(customer.id);
                                            ref.invalidate(customersProvider);
                                            if (context.mounted) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(content: Text(
                                                  customer.isBlocked ? 'Customer unblocked' : 'Customer blocked',
                                                )),
                                              );
                                            }
                                          } catch (e) {
                                            if (context.mounted) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(content: Text('Error: $e')),
                                              );
                                            }
                                          }
                                        } else {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(content: Text('$value action performed')),
                                          );
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
                    _buildPagination(context, ref, currentPage, totalPages, filtered.length),
                  ],
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: TextField(
          decoration: InputDecoration(
            hintText: 'Search customers by name, email, or phone...',
            prefixIcon: const Icon(Icons.search, size: 20),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            filled: true,
            fillColor: isDark ? Colors.white10 : Colors.grey.shade100,
          ),
          onChanged: (v) => ref.read(customerSearchProvider.notifier).state = v,
        ),
      ),
    );
  }

  Widget _buildPagination(BuildContext context, WidgetRef ref, int current, int total, int totalItems) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Showing ${(current - 1) * 10 + 1}-${(current * 10).clamp(0, totalItems)} of $totalItems'),
          Row(
            children: [
              IconButton(
                onPressed: current > 1 ? () => ref.read(customerPageProvider.notifier).state = current - 1 : null,
                icon: const Icon(Icons.chevron_left, size: 20),
              ),
              Text('$current / $total'),
              IconButton(
                onPressed: current < total ? () => ref.read(customerPageProvider.notifier).state = current + 1 : null,
                icon: const Icon(Icons.chevron_right, size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

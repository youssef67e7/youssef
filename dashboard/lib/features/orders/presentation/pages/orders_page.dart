import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/widgets/filter_chip_group.dart';
import 'package:pharmaworld_dashboard/shared/widgets/export_button.dart';
import 'package:pharmaworld_dashboard/shared/models/order_model.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';
import 'package:pharmaworld_dashboard/features/orders/providers/orders_provider.dart';

class OrdersPage extends ConsumerWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(ordersProvider);
    final statusFilter = ref.watch(orderStatusFilterProvider);
    final searchQuery = ref.watch(orderSearchProvider);
    final currentPage = ref.watch(orderPageProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Orders',
            subtitle: 'Manage and track all orders',
            actions: [
              ExportButton(
                fileName: 'orders',
                headers: ['Order #', 'Customer', 'Amount', 'Status', 'Date'],
                data: [],
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildFilters(context, ref),
          const SizedBox(height: 16),
          ordersAsync.when(
            data: (allOrders) {
              var filtered = allOrders;
              if (statusFilter.isNotEmpty) {
                filtered = filtered.where((o) => o.status == statusFilter).toList();
              }
              if (searchQuery.isNotEmpty) {
                filtered = filtered
                    .where((o) =>
                        o.orderNumber.toLowerCase().contains(searchQuery.toLowerCase()) ||
                        (o.customerName?.toLowerCase().contains(searchQuery.toLowerCase()) ?? false))
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
                            DataColumn(label: Text('Order #')),
                            DataColumn(label: Text('Customer')),
                            DataColumn(label: Text('Items'), numeric: true),
                            DataColumn(label: Text('Total'), numeric: true),
                            DataColumn(label: Text('Payment')),
                            DataColumn(label: Text('Driver')),
                            DataColumn(label: Text('Status')),
                            DataColumn(label: Text('Date')),
                            DataColumn(label: Text('Actions')),
                          ],
                          rows: paged
                              .map(
                                (order) => DataRow(cells: [
                                  DataCell(Text(order.orderNumber, style: const TextStyle(fontWeight: FontWeight.w500))),
                                  DataCell(Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(order.customerName ?? '-'),
                                      Text(
                                        order.customerPhone ?? '',
                                        style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                                      ),
                                    ],
                                  )),
                                  DataCell(Text(order.itemCount.toString())),
                                  DataCell(Text(Formatters.formatCurrency(order.totalAmount))),
                                  DataCell(Text(order.paymentMethod.replaceAll('_', ' ').toUpperCase(),
                                      style: const TextStyle(fontSize: 11))),
                                  DataCell(Text(order.driverName ?? 'Unassigned',
                                      style: TextStyle(
                                        color: order.driverId == null ? Colors.orange : null,
                                        fontSize: 12,
                                      ))),
                                  DataCell(StatusBadge(status: order.status)),
                                  DataCell(Text(Formatters.timeAgo(order.createdAt))),
                                  DataCell(
                                    PopupMenuButton<String>(
                                      itemBuilder: (context) => [
                                        const PopupMenuItem(value: 'view', child: Text('View Details')),
                                        const PopupMenuItem(value: 'status', child: Text('Update Status')),
                                        if (order.driverId == null)
                                          const PopupMenuItem(value: 'assign', child: Text('Assign Driver')),
                                        const PopupMenuItem(value: 'invoice', child: Text('Print Invoice')),
                                      ],
                                      onSelected: (value) => _handleOrderAction(context, ref, value, order),
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
            loading: () => const Center(child: Padding(
              padding: EdgeInsets.all(40),
              child: CircularProgressIndicator(),
            )),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(BuildContext context, WidgetRef ref) {
    final statusFilter = ref.watch(orderStatusFilterProvider);
    final searchQuery = ref.watch(orderSearchProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Search orders...',
                      prefixIcon: const Icon(Icons.search, size: 20),
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: isDark ? Colors.white10 : Colors.grey.shade100,
                    ),
                    onChanged: (v) => ref.read(orderSearchProvider.notifier).state = v,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FilterChipGroup(
              options: const [
                'pending', 'confirmed', 'preparing', 'ready',
                'out_for_delivery', 'delivered', 'cancelled', 'returned',
              ],
              selected: statusFilter,
              onSelected: (v) => ref.read(orderStatusFilterProvider.notifier).state = v,
            ),
          ],
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
                onPressed: current > 1 ? () => ref.read(orderPageProvider.notifier).state = current - 1 : null,
                icon: const Icon(Icons.chevron_left, size: 20),
              ),
              Text('$current / $total'),
              IconButton(
                onPressed: current < total ? () => ref.read(orderPageProvider.notifier).state = current + 1 : null,
                icon: const Icon(Icons.chevron_right, size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _handleOrderAction(BuildContext context, WidgetRef ref, String action, Order order) {
    switch (action) {
      case 'view':
        _showOrderDetail(context, order);
        break;
      case 'status':
        _showStatusUpdateDialog(context, ref, order);
        break;
      case 'assign':
        _showAssignDriverDialog(context, ref, order);
        break;
      case 'invoice':
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invoice printed')),
        );
        break;
    }
  }

  void _showOrderDetail(BuildContext context, Order order) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Order ${order.orderNumber}'),
        content: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _detailRow('Customer', order.customerName ?? '-'),
              _detailRow('Status', order.status),
              _detailRow('Total', Formatters.formatCurrency(order.totalAmount)),
              _detailRow('Payment', order.paymentMethod.replaceAll('_', ' ')),
              _detailRow('Driver', order.driverName ?? 'Unassigned'),
              _detailRow('Address', order.deliveryAddress ?? '-'),
              _detailRow('Date', Formatters.formatDateTime(order.createdAt)),
              const Divider(),
              const Text('Items:', style: TextStyle(fontWeight: FontWeight.w600)),
              ...order.items.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(item.medicineName),
                        Text('x${item.quantity} - ${Formatters.formatCurrency(item.totalPrice)}'),
                      ],
                    ),
                  )),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }

  void _showStatusUpdateDialog(BuildContext context, WidgetRef ref, Order order) {
    String newStatus = order.status;
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Update Order Status'),
          content: DropdownButtonFormField<String>(
            value: newStatus,
            decoration: const InputDecoration(labelText: 'Status'),
            items: const [
              DropdownMenuItem(value: 'pending', child: Text('Pending')),
              DropdownMenuItem(value: 'confirmed', child: Text('Confirmed')),
              DropdownMenuItem(value: 'preparing', child: Text('Preparing')),
              DropdownMenuItem(value: 'ready', child: Text('Ready')),
              DropdownMenuItem(value: 'out_for_delivery', child: Text('Out for Delivery')),
              DropdownMenuItem(value: 'delivered', child: Text('Delivered')),
              DropdownMenuItem(value: 'cancelled', child: Text('Cancelled')),
            ],
            onChanged: (v) => setState(() => newStatus = v ?? newStatus),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                try {
                  final api = ref.read(apiServiceProvider);
                  await api.updateOrderStatus(order.id, newStatus);
                  ref.invalidate(ordersProvider);
                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Order status updated')),
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
              child: const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAssignDriverDialog(BuildContext context, WidgetRef ref, Order order) {
    String? selectedDriverId;
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Assign Driver'),
          content: DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: 'Select Driver'),
            items: const [
              DropdownMenuItem(value: 'DRV-1', child: Text('Mohammed Driver (Online)')),
              DropdownMenuItem(value: 'DRV-2', child: Text('Salem Driver (Online)')),
              DropdownMenuItem(value: 'DRV-3', child: Text('Ali Driver (Offline)')),
            ],
            onChanged: (v) => setState(() => selectedDriverId = v),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                if (selectedDriverId == null) return;
                try {
                  final api = ref.read(apiServiceProvider);
                  await api.assignDriver(order.id, selectedDriverId!);
                  ref.invalidate(ordersProvider);
                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Driver assigned successfully')),
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
              child: const Text('Assign'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text('$label:', style: TextStyle(color: Colors.grey.shade600)),
          ),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}

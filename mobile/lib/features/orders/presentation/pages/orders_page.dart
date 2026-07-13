import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../shared/widgets/order_status_chip.dart';
import '../../../shared/widgets/empty_state.dart';

class OrdersPage extends ConsumerStatefulWidget {
  const OrdersPage({super.key});

  @override
  ConsumerState<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends ConsumerState<OrdersPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 6, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Orders'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Pending'),
            Tab(text: 'Confirmed'),
            Tab(text: 'Processing'),
            Tab(text: 'Delivered'),
            Tab(text: 'Cancelled'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOrderList(),
          _buildOrderList(status: 'pending'),
          _buildOrderList(status: 'confirmed'),
          _buildOrderList(status: 'processing'),
          _buildOrderList(status: 'delivered'),
          _buildOrderList(status: 'cancelled'),
        ],
      ),
    );
  }

  Widget _buildOrderList({String? status}) {
    final orders = status == null
        ? _allOrders
        : _allOrders.where((o) => o['status'] == status).toList();

    if (orders.isEmpty) {
      return const EmptyState(
        type: EmptyStateType.emptyOrders,
        title: 'No orders found',
        subtitle: 'You have no orders in this category',
        buttonText: 'Go Shopping',
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(16.r),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        final order = orders[index];
        return Card(
          margin: EdgeInsets.only(bottom: 8.h),
          child: InkWell(
            onTap: () {
              context.push('/orders/${order['id']}');
            },
            borderRadius: BorderRadius.circular(12.r),
            padding: EdgeInsets.all(12.r),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Order #${order['id']}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    OrderStatusChip(status: order['status']),
                  ],
                ),
                SizedBox(height: 8.h),
                Text(
                  order['date'],
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                SizedBox(height: 4.h),
                Text(
                  '${order['items']} items',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    Text(
                      'E£${order['total']}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.error,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  static final _allOrders = [
    {'id': 'PW2024001', 'date': 'Jan 15, 2024', 'items': 3, 'total': '310.00', 'status': 'delivered'},
    {'id': 'PW2024002', 'date': 'Jan 20, 2024', 'items': 1, 'total': '120.00', 'status': 'processing'},
    {'id': 'PW2024003', 'date': 'Jan 25, 2024', 'items': 5, 'total': '545.00', 'status': 'pending'},
    {'id': 'PW2024004', 'date': 'Feb 01, 2024', 'items': 2, 'total': '195.00', 'status': 'confirmed'},
    {'id': 'PW2024005', 'date': 'Feb 05, 2024', 'items': 4, 'total': '420.00', 'status': 'cancelled'},
  ];
}

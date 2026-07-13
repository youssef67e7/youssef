import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import 'package:pharmaworld/core/router/route_names.dart';
import 'package:pharmaworld/shared/widgets/order_status_chip.dart';
import 'package:pharmaworld/shared/widgets/empty_state.dart';
import 'package:pharmaworld/features/orders/presentation/providers/order_provider.dart';

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
    final ordersAsync = ref.watch(ordersProvider(status));

    return ordersAsync.when(
      data: (orders) {
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
                  context.push(RouteNames.orderDetailPath(order.id ?? ''));
                },
                borderRadius: BorderRadius.circular(12.r),
                child: Padding(
                  padding: EdgeInsets.all(12.r),
                  child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Order #${order.orderNumber ?? order.id}',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        OrderStatusChip(status: order.status ?? ''),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      order.createdAt?.toString().substring(0, 10) ?? '',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      '${order.items?.length ?? 0} items',
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
                          'E£${order.total?.toStringAsFixed(2) ?? '0.00'}',
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
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48),
            const SizedBox(height: 16),
            const Text('Failed to load orders'),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () => ref.invalidate(ordersProvider(status)),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

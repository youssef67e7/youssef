import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/empty_state.dart';

class CouponsPage extends ConsumerStatefulWidget {
  const CouponsPage({super.key});

  @override
  ConsumerState<CouponsPage> createState() => _CouponsPageState();
}

class _CouponsPageState extends ConsumerState<CouponsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _couponController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _couponController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Coupons'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Available'),
            Tab(text: 'My Coupons'),
          ],
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16.r),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _couponController,
                    decoration: InputDecoration(
                      hintText: 'Enter coupon code',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16.w,
                        vertical: 12.h,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.r),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 8.w),
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Coupon applied!')),
                    );
                  },
                  child: const Text('Apply'),
                ),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildAvailableCoupons(),
                _buildMyCoupons(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailableCoupons() {
    final coupons = [
      {'code': 'WELCOME20', 'discount': '20%', 'description': 'First order discount', 'expiry': 'Mar 31, 2024'},
      {'code': 'HEALTH10', 'discount': '10%', 'description': 'Health products', 'expiry': 'Apr 15, 2024'},
      {'code': 'FREESHIP', 'discount': 'Free Shipping', 'description': 'On orders over E£200', 'expiry': 'Apr 30, 2024'},
    ];

    return ListView.builder(
      padding: EdgeInsets.all(16.r),
      itemCount: coupons.length,
      itemBuilder: (context, index) {
        final coupon = coupons[index];
        return Card(
          margin: EdgeInsets.only(bottom: 12.h),
          child: Padding(
            padding: EdgeInsets.all(16.r),
            child: Row(
              children: [
                Container(
                  width: 70.w,
                  height: 70.h,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    coupon['discount']!,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ),
                SizedBox(width: 16.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        coupon['code']!,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(coupon['description']!),
                      Text(
                        'Expires: ${coupon['expiry']}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {},
                  child: const Text('Use'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMyCoupons() {
    return const Center(
      child: EmptyState(
        type: EmptyStateType.noData,
        title: 'No coupons yet',
        subtitle: 'Your claimed coupons will appear here',
      ),
    );
  }
}

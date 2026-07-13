import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class LoyaltyPage extends ConsumerWidget {
  const LoyaltyPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Loyalty Points')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          children: [
            Card(
              color: theme.colorScheme.primary,
              child: Padding(
                padding: EdgeInsets.all(24.r),
                child: Column(
                  children: [
                    Icon(Icons.loyalty, size: 48.r, color: Colors.white),
                    SizedBox(height: 12.h),
                    Text(
                      '1,250',
                      style: TextStyle(
                        fontSize: 36.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Points Balance',
                      style: TextStyle(color: Colors.white.withOpacity(0.8)),
                    ),
                    SizedBox(height: 16.h),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildTierBadge('Bronze', false),
                        _buildTierBadge('Silver', true),
                        _buildTierBadge('Gold', false),
                        _buildTierBadge('Platinum', false),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    LinearProgressIndicator(
                      value: 0.62,
                      backgroundColor: Colors.white.withOpacity(0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      '750 points to Silver tier',
                      style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12.sp),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24.h),
            Row(
              children: [
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.r),
                      child: Column(
                        children: [
                          Icon(Icons.add_circle, color: theme.colorScheme.primary),
                          SizedBox(height: 8.h),
                          Text('Earn', style: theme.textTheme.titleMedium),
                          Text('450 pts', style: TextStyle(color: theme.colorScheme.primary)),
                        ],
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.r),
                      child: Column(
                        children: [
                          Icon(Icons.redeem, color: theme.colorScheme.secondary),
                          SizedBox(height: 8.h),
                          Text('Redeemed', style: theme.textTheme.titleMedium),
                          Text('200 pts', style: TextStyle(color: theme.colorScheme.secondary)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 24.h),
            Text(
              'Points History',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12.h),
            ...List.generate(5, (index) {
              return Card(
                margin: EdgeInsets.only(bottom: 8.h),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: index % 2 == 0
                        ? Colors.green.withOpacity(0.1)
                        : Colors.red.withOpacity(0.1),
                    child: Icon(
                      index % 2 == 0 ? Icons.add : Icons.remove,
                      color: index % 2 == 0 ? Colors.green : Colors.red,
                    ),
                  ),
                  title: Text(index % 2 == 0 ? 'Points Earned' : 'Points Redeemed'),
                  subtitle: Text('Order #PW202400${index + 1}'),
                  trailing: Text(
                    '${index % 2 == 0 ? '+' : '-'}${(index + 1) * 50}',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: index % 2 == 0 ? Colors.green : Colors.red,
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildTierBadge(String label, bool isActive) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: isActive ? Colors.white : Colors.white.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10.sp,
          fontWeight: FontWeight.w600,
          color: isActive ? Colors.black87 : Colors.white70,
        ),
      ),
    );
  }
}

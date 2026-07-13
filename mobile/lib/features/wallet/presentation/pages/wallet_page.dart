import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class WalletPage extends ConsumerStatefulWidget {
  const WalletPage({super.key});

  @override
  ConsumerState<WalletPage> createState() => _WalletPageState();
}

class _WalletPageState extends ConsumerState<WalletPage> {
  double _balance = 1250.0;
  final List<Map<String, dynamic>> _transactions = [
    {'type': 'credit', 'amount': 500.0, 'description': 'Top Up', 'date': 'Jan 15, 2024'},
    {'type': 'debit', 'amount': 120.0, 'description': 'Order #PW2024001', 'date': 'Jan 20, 2024'},
    {'type': 'credit', 'amount': 1000.0, 'description': 'Top Up', 'date': 'Feb 01, 2024'},
    {'type': 'debit', 'amount': 85.0, 'description': 'Order #PW2024002', 'date': 'Feb 05, 2024'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              color: theme.colorScheme.primary,
              child: Padding(
                padding: EdgeInsets.all(24.r),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Wallet Balance',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 14.sp,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      'E£${_balance.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 32.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 16.h),
                    SizedBox(
                      width: 140.w,
                      child: ElevatedButton(
                        onPressed: _showTopUpDialog,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: theme.colorScheme.primary,
                        ),
                        child: const Text('Top Up'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24.h),
            Text(
              'Transaction History',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12.h),
            ..._transactions.map((tx) {
              return Card(
                margin: EdgeInsets.only(bottom: 8.h),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: tx['type'] == 'credit'
                        ? Colors.green.withOpacity(0.1)
                        : Colors.red.withOpacity(0.1),
                    child: Icon(
                      tx['type'] == 'credit'
                          ? Icons.arrow_downward
                          : Icons.arrow_upward,
                      color: tx['type'] == 'credit' ? Colors.green : Colors.red,
                      size: 20.r,
                    ),
                  ),
                  title: Text(tx['description']),
                  subtitle: Text(tx['date']),
                  trailing: Text(
                    '${tx['type'] == 'credit' ? '+' : '-'}E£${tx['amount'].toStringAsFixed(2)}',
                    style: TextStyle(
                      color: tx['type'] == 'credit' ? Colors.green : Colors.red,
                      fontWeight: FontWeight.bold,
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

  void _showTopUpDialog() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: EdgeInsets.all(16.r),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Top Up Wallet', style: Theme.of(context).textTheme.titleLarge),
            SizedBox(height: 16.h),
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: [50, 100, 200, 500, 1000].map((amount) {
                return ActionChip(
                  label: Text('E£$amount'),
                  onPressed: () {
                    setState(() {
                      _balance += amount;
                      _transactions.insert(0, {
                        'type': 'credit',
                        'amount': amount.toDouble(),
                        'description': 'Top Up',
                        'date': 'Just now',
                      });
                    });
                    Navigator.pop(context);
                  },
                );
              }).toList(),
            ),
            SizedBox(height: 16.h),
          ],
        ),
      ),
    );
  }
}

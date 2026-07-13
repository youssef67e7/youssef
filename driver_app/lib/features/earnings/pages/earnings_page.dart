import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/core/utils/formatters.dart';
import 'package:pharmaworld_driver/core/utils/snackbar_helper.dart';
import 'package:pharmaworld_driver/features/earnings/provider/earnings_provider.dart';
import 'package:pharmaworld_driver/shared/widgets/loading_indicator.dart';
import 'package:pharmaworld_driver/shared/widgets/empty_state.dart';
import 'package:pharmaworld_driver/shared/widgets/earnings_card.dart';

class EarningsPage extends ConsumerWidget {
  const EarningsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final earningsAsync = ref.watch(earningsProvider);
    final historyAsync = ref.watch(filteredEarningsHistoryProvider);
    final selectedPeriod = ref.watch(selectedPeriodProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.earnings ?? 'Earnings'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(earningsProvider);
          ref.invalidate(filteredEarningsHistoryProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              earningsAsync.when(
                data: (earnings) => _buildEarningsSummary(context, earnings, l10n),
                loading: () => const LoadingIndicator(),
                error: (e, _) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 24),
              _buildPeriodSelector(context, ref, selectedPeriod, l10n),
              const SizedBox(height: 16),
              historyAsync.when(
                data: (records) {
                  if (records.isEmpty) {
                    return EmptyState(
                      icon: Icons.history,
                      title: l10n?.noEarningsYet ?? 'No earnings yet',
                      subtitle: l10n?.earningsWillAppear ?? 'Your earnings will appear here',
                    );
                  }
                  return _buildEarningsHistory(context, records, l10n);
                },
                loading: () => const LoadingIndicator(),
                error: (e, _) => EmptyState(
                  icon: Icons.error_outline,
                  title: l10n?.failedToLoad ?? 'Failed to load',
                  subtitle: e.toString(),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton.icon(
            onPressed: () => _showWithdrawDialog(context, ref, l10n),
            icon: const Icon(Icons.account_balance_wallet),
            label: Text(l10n?.withdraw ?? 'Withdraw'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryLight,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEarningsSummary(BuildContext context, dynamic earnings, AppLocalizations? l10n) {
    return Column(
      children: [
        EarningsCard(
          title: l10n?.todayEarnings ?? "Today's Earnings",
          amount: earnings.todayEarnings,
          deliveries: earnings.todayDeliveries,
          color: AppColors.success,
          icon: Icons.today,
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: EarningsCard(
                title: l10n?.weeklyEarnings ?? 'Weekly',
                amount: earnings.weeklyEarnings,
                color: AppColors.info,
                icon: Icons.view_week,
                isCompact: true,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: EarningsCard(
                title: l10n?.monthlyEarnings ?? 'Monthly',
                amount: earnings.monthlyEarnings,
                color: AppColors.warning,
                icon: Icons.calendar_month,
                isCompact: true,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n?.totalEarnings ?? 'Total Earnings',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 16),
                _buildBreakdownRow(
                  icon: Icons.attach_money,
                  label: l10n?.baseFee ?? 'Base Fee',
                  amount: earnings.baseFeesTotal,
                ),
                _buildBreakdownRow(
                  icon: Icons.volunteer_activism,
                  label: l10n?.tips ?? 'Tips',
                  amount: earnings.tipsTotal,
                ),
                _buildBreakdownRow(
                  icon: Icons.star,
                  label: l10n?.bonuses ?? 'Bonuses',
                  amount: earnings.bonusesTotal,
                ),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      Formatters.formatCurrency(earnings.totalEarnings),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBreakdownRow({
    required IconData icon,
    required String label,
    required double amount,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const SizedBox(width: 8),
          Text(label),
          const Spacer(),
          Text(
            Formatters.formatCurrency(amount),
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodSelector(BuildContext context, WidgetRef ref, String selected, AppLocalizations? l10n) {
    return SegmentedButton<String>(
      segments: [
        ButtonSegment(
          value: 'daily',
          label: Text(l10n?.today ?? 'Daily'),
        ),
        ButtonSegment(
          value: 'weekly',
          label: Text(l10n?.thisWeek ?? 'Weekly'),
        ),
        ButtonSegment(
          value: 'monthly',
          label: Text(l10n?.thisMonth ?? 'Monthly'),
        ),
      ],
      selected: {selected},
      onSelectionChanged: (Set<String> value) {
        ref.read(selectedPeriodProvider.notifier).state = value.first;
      },
    );
  }

  Widget _buildEarningsHistory(BuildContext context, List records, AppLocalizations? l10n) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              l10n?.earningsHistory ?? 'Earnings History',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
          const Divider(height: 0),
          ...records.map<Widget>((record) => ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.success.withOpacity(0.1),
                  child: const Icon(Icons.attach_money, color: AppColors.success),
                ),
                title: Text('Order #${record.orderId}'),
                subtitle: Text(Formatters.formatRelativeTime(record.date)),
                trailing: Text(
                  Formatters.formatCurrency(record.totalAmount),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.success,
                  ),
                ),
              )),
        ],
      ),
    );
  }

  void _showWithdrawDialog(BuildContext context, WidgetRef ref, AppLocalizations? l10n) {
    final amountController = TextEditingController();
    String selectedMethod = 'bank';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text(l10n?.withdraw ?? 'Withdraw Earnings'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Amount',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: selectedMethod,
                decoration: const InputDecoration(
                  labelText: 'Withdrawal Method',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'bank', child: Text('Bank Transfer')),
                  DropdownMenuItem(value: 'wallet', child: Text('Digital Wallet')),
                ],
                onChanged: (value) {
                  setState(() => selectedMethod = value!);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(l10n?.cancel ?? 'Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(amountController.text);
                if (amount == null || amount <= 0) {
                  SnackbarHelper.showError(context, 'Please enter a valid amount');
                  return;
                }
                Navigator.pop(context);
                try {
                  await ref.read(withdrawProvider.notifier).withdraw(amount, selectedMethod);
                  if (context.mounted) {
                    SnackbarHelper.showSuccess(context, 'Withdrawal request submitted');
                  }
                } catch (e) {
                  if (context.mounted) {
                    SnackbarHelper.showError(context, e.toString());
                  }
                }
              },
              child: Text(l10n?.confirm ?? 'Confirm'),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/features/profile/provider/profile_provider.dart';
import 'package:pharmaworld_driver/shared/providers/auth_provider.dart';
import 'package:pharmaworld_driver/shared/widgets/loading_indicator.dart';
import 'package:pharmaworld_driver/shared/widgets/stat_card.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final profileAsync = ref.watch(profileProvider);
    final statisticsAsync = ref.watch(statisticsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.profile ?? 'Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => context.push('/profile/edit'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(profileProvider);
          ref.invalidate(statisticsProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              profileAsync.when(
                data: (user) => _buildProfileHeader(context, user, l10n),
                loading: () => const LoadingIndicator(),
                error: (e, _) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 16),
              statisticsAsync.when(
                data: (stats) => _buildStatistics(context, stats, l10n),
                loading: () => const LoadingIndicator(),
                error: (e, _) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 16),
              _buildMenuSection(context, ref, l10n),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, dynamic user, AppLocalizations? l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            CircleAvatar(
              radius: 50,
              backgroundColor: AppColors.primaryLight,
              child: user.profileImage != null
                  ? ClipOval(
                      child: Image.network(
                        user.profileImage!,
                        width: 100,
                        height: 100,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Text(
                          user.name.isNotEmpty ? user.name[0].toUpperCase() : 'D',
                          style: const TextStyle(
                            fontSize: 40,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    )
                    : Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : 'D',
                        style: const TextStyle(
                          fontSize: 40,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
            ),
            const SizedBox(height: 16),
            Text(
              user.name.isNotEmpty ? user.name : 'Driver',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              user.phone,
              style: const TextStyle(
                color: Colors.grey,
                fontSize: 16,
              ),
            ),
            if (user.email != null && user.email!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                user.email!,
                style: const TextStyle(
                  color: Colors.grey,
                ),
              ),
            ],
            const SizedBox(height: 16),
            if (user.rating != null)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 24),
                  const SizedBox(width: 4),
                  Text(
                    user.rating!.toStringAsFixed(1),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatistics(BuildContext context, Map<String, dynamic> stats, AppLocalizations? l10n) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        StatCard(
          icon: Icons.local_shipping_outlined,
          title: l10n?.totalDeliveries ?? 'Total Deliveries',
          value: '${stats['totalDeliveries'] ?? 0}',
          color: AppColors.info,
        ),
        StatCard(
          icon: Icons.check_circle_outline,
          title: l10n?.successRate ?? 'Success Rate',
          value: '${(stats['completionRate'] ?? 0.0).toStringAsFixed(0)}%',
          color: AppColors.success,
        ),
        StatCard(
          icon: Icons.star_outline,
          title: l10n?.rating ?? 'Rating',
          value: '${(stats['rating'] ?? 0.0).toStringAsFixed(1)}',
          color: AppColors.warning,
        ),
        StatCard(
          icon: Icons.check,
          title: 'Successful',
          value: '${stats['successfulDeliveries'] ?? 0}',
          color: AppColors.primaryLight,
        ),
      ],
    );
  }

  Widget _buildMenuSection(BuildContext context, WidgetRef ref, AppLocalizations? l10n) {
    return Card(
      child: Column(
        children: [
          _buildMenuItem(
            context,
            icon: Icons.person_outline,
            title: l10n?.editProfile ?? 'Edit Profile',
            onTap: () => context.push('/profile/edit'),
          ),
          const Divider(height: 1),
          _buildMenuItem(
            context,
            icon: Icons.directions_car_outlined,
            title: l10n?.vehicleInfo ?? 'Vehicle Info',
            onTap: () {},
          ),
          const Divider(height: 1),
          _buildMenuItem(
            context,
            icon: Icons.description_outlined,
            title: l10n?.documents ?? 'Documents',
            onTap: () {},
          ),
          const Divider(height: 1),
          _buildMenuItem(
            context,
            icon: Icons.settings_outlined,
            title: l10n?.settings ?? 'Settings',
            onTap: () => context.push('/settings'),
          ),
          const Divider(height: 1),
          _buildMenuItem(
            context,
            icon: Icons.logout,
            title: l10n?.logout ?? 'Logout',
            color: AppColors.error,
            onTap: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text(l10n?.areYouSure ?? 'Are you sure?'),
                  content: Text(l10n?.logout ?? 'Logout'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: Text(l10n?.cancel ?? 'Cancel'),
                    ),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context, true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.error,
                      ),
                      child: Text(l10n?.logout ?? 'Logout'),
                    ),
                  ],
                ),
              );
              if (confirmed == true && context.mounted) {
                await ref.read(authStateProvider.notifier).logout();
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? color,
  }) {
    return ListTile(
      leading: Icon(icon, color: color ?? Colors.grey),
      title: Text(
        title,
        style: TextStyle(color: color),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: color ?? Colors.grey,
      ),
      onTap: onTap,
    );
  }
}

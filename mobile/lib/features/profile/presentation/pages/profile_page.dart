import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import 'package:pharmaworld/core/router/route_names.dart';
import 'package:pharmaworld/shared/providers/auth_provider.dart';
import 'package:pharmaworld/shared/widgets/custom_avatar.dart';
import 'package:pharmaworld/features/profile/presentation/providers/profile_provider.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final user = ref.watch(currentUserProvider);
    final profile = ref.watch(profileProvider);

    final displayName = profile.name ?? user?.name ?? 'John Doe';
    final displayEmail = profile.email ?? user?.email ?? 'john@example.com';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push(RouteNames.settings),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Column(
          children: [
            Card(
              child: Padding(
                padding: EdgeInsets.all(20.r),
                child: Column(
                  children: [
                    CustomAvatar(
                      name: displayName,
                      imageUrl: user?.avatar,
                      radius: 40,
                    ),
                    SizedBox(height: 12.h),
                    Text(
                      displayName,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      displayEmail,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    SizedBox(height: 16.h),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => context.push(RouteNames.editProfile),
                        child: const Text('Edit Profile'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16.h),
            _buildMenuItem(
              context,
              icon: Icons.shopping_bag_outlined,
              title: 'My Orders',
              onTap: () => context.push(RouteNames.orders),
            ),
            _buildMenuItem(
              context,
              icon: Icons.favorite_border,
              title: 'Wishlist',
              onTap: () => context.push(RouteNames.wishlist),
            ),
            _buildMenuItem(
              context,
              icon: Icons.location_on_outlined,
              title: 'Addresses',
              onTap: () => context.push(RouteNames.addresses),
            ),
            _buildMenuItem(
              context,
              icon: Icons.account_balance_wallet_outlined,
              title: 'Wallet',
              onTap: () => context.push(RouteNames.wallet),
            ),
            _buildMenuItem(
              context,
              icon: Icons.local_offer_outlined,
              title: 'My Coupons',
              onTap: () => context.push(RouteNames.coupons),
            ),
            _buildMenuItem(
              context,
              icon: Icons.star_border,
              title: 'My Reviews',
              onTap: () => context.push(RouteNames.reviews),
            ),
            _buildMenuItem(
              context,
              icon: Icons.loyalty,
              title: 'Loyalty Points',
              onTap: () => context.push(RouteNames.loyalty),
            ),
            _buildMenuItem(
              context,
              icon: Icons.card_giftcard,
              title: 'Referral',
              onTap: () => context.push(RouteNames.referral),
            ),
            _buildMenuItem(
              context,
              icon: Icons.support_agent,
              title: 'Support',
              onTap: () => context.push(RouteNames.support),
            ),
            _buildMenuItem(
              context,
              icon: Icons.lock_outlined,
              title: 'Change Password',
              onTap: () => context.push(RouteNames.changePassword),
            ),
            SizedBox(height: 8.h),
            _buildMenuItem(
              context,
              icon: Icons.logout,
              title: 'Logout',
              isDestructive: true,
              onTap: () async {
                await ref.read(authStateProvider.notifier).logout();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    final theme = Theme.of(context);

    return Card(
      margin: EdgeInsets.only(bottom: 8.h),
      child: ListTile(
        leading: Icon(
          icon,
          color: isDestructive ? theme.colorScheme.error : null,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isDestructive ? theme.colorScheme.error : null,
          ),
        ),
        trailing: Icon(
          Icons.arrow_forward_ios,
          size: 16.r,
          color: theme.colorScheme.onSurfaceVariant,
        ),
        onTap: onTap,
      ),
    );
  }
}

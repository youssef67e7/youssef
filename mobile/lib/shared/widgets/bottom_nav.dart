import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_icons.dart';
import '../../core/router/route_names.dart';
import '../../features/cart/presentation/providers/cart_provider.dart';
import 'custom_badge.dart';

class BottomNav extends ConsumerWidget {
  final int currentIndex;
  final Widget child;

  const BottomNav({
    super.key,
    required this.currentIndex,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final cartState = ref.watch(cartProvider);
    final cartCount = cartState.itemCount;
    final showBadge = cartCount > 0;

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          switch (index) {
            case 0:
              context.go(RouteNames.home);
              break;
            case 1:
              context.go(RouteNames.categories);
              break;
            case 2:
              context.go(RouteNames.cart);
              break;
            case 3:
              context.go(RouteNames.profile);
              break;
          }
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(AppIcons.home),
            selectedIcon: const Icon(AppIcons.homeFilled),
            label: 'Home',
          ),
          NavigationDestination(
            icon: const Icon(AppIcons.category),
            selectedIcon: const Icon(AppIcons.categoryFilled),
            label: 'Categories',
          ),
          NavigationDestination(
            icon: CustomBadge(
              count: '$cartCount',
              showBadge: showBadge,
              child: const Icon(AppIcons.cartIcon),
            ),
            selectedIcon: CustomBadge(
              count: '$cartCount',
              showBadge: showBadge,
              child: const Icon(AppIcons.cartFilled),
            ),
            label: 'Cart',
          ),
          NavigationDestination(
            icon: const Icon(AppIcons.profile),
            selectedIcon: const Icon(AppIcons.profileFilled),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

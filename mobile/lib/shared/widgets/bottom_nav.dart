import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import 'package:pharmaworld/core/constants/app_icons.dart';
import 'package:pharmaworld/core/router/route_names.dart';
import 'package:pharmaworld/features/cart/presentation/providers/cart_provider.dart';
import 'package:pharmaworld/shared/widgets/custom_badge.dart';

class BottomNav extends ConsumerWidget {

  const BottomNav({
    super.key,
    required this.currentIndex,
    required this.child,
  });
  final int currentIndex;
  final Widget child;

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
          const NavigationDestination(
            icon: Icon(AppIcons.home),
            selectedIcon: Icon(AppIcons.homeFilled),
            label: 'Home',
          ),
          const NavigationDestination(
            icon: Icon(AppIcons.category),
            selectedIcon: Icon(AppIcons.categoryFilled),
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
          const NavigationDestination(
            icon: Icon(AppIcons.profile),
            selectedIcon: Icon(AppIcons.profileFilled),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

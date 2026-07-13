import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pharmaworld_dashboard/shared/providers/sidebar_provider.dart';
import 'package:pharmaworld_dashboard/core/constants/app_constants.dart';
import 'package:pharmaworld_dashboard/core/constants/app_colors.dart';

class Sidebar extends ConsumerWidget {
  final bool isCollapsed;
  final bool isMobile;

  const Sidebar({
    super.key,
    this.isCollapsed = false,
    this.isMobile = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedRoute = ref.watch(selectedMenuProvider);

    final width = isMobile
        ? 280.0
        : isCollapsed
            ? AppConstants.sidebarCollapsedWidth
            : AppConstants.sidebarWidth;

    return Container(
      width: width,
      height: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? AppColors.sidebarDark : AppColors.sidebarLight,
        border: Border(
          right: BorderSide(
            color: isDark ? Colors.white12 : Colors.grey.shade200,
          ),
        ),
      ),
      child: Column(
        children: [
          _buildLogo(isCollapsed, isDark),
          const Divider(height: 1),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Column(
                children: [
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.dashboard_outlined,
                    activeIcon: Icons.dashboard,
                    label: 'Dashboard',
                    route: '/dashboard',
                    isSelected: selectedRoute == '/dashboard',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildSectionHeader('Catalog', isCollapsed, isDark),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.medication_outlined,
                    activeIcon: Icons.medication,
                    label: 'Medicines',
                    route: '/medicines',
                    isSelected: selectedRoute == '/medicines',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.category_outlined,
                    activeIcon: Icons.category,
                    label: 'Categories',
                    route: '/categories',
                    isSelected: selectedRoute == '/categories',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.branding_watermark_outlined,
                    activeIcon: Icons.branding_watermark,
                    label: 'Brands',
                    route: '/brands',
                    isSelected: selectedRoute == '/brands',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildSectionHeader('Operations', isCollapsed, isDark),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.shopping_cart_outlined,
                    activeIcon: Icons.shopping_cart,
                    label: 'Orders',
                    route: '/orders',
                    isSelected: selectedRoute == '/orders',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.replay_outlined,
                    activeIcon: Icons.replay,
                    label: 'Returns',
                    route: '/returns',
                    isSelected: selectedRoute == '/returns',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.delivery_dining_outlined,
                    activeIcon: Icons.delivery_dining,
                    label: 'Drivers',
                    route: '/drivers',
                    isSelected: selectedRoute == '/drivers',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildSectionHeader('People', isCollapsed, isDark),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.people_outlined,
                    activeIcon: Icons.people,
                    label: 'Customers',
                    route: '/customers',
                    isSelected: selectedRoute == '/customers',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildSectionHeader('Marketing', isCollapsed, isDark),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.local_offer_outlined,
                    activeIcon: Icons.local_offer,
                    label: 'Coupons',
                    route: '/coupons',
                    isSelected: selectedRoute == '/coupons',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.local_offer_outlined,
                    activeIcon: Icons.local_offer,
                    label: 'Offers',
                    route: '/offers',
                    isSelected: selectedRoute == '/offers',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.view_carousel_outlined,
                    activeIcon: Icons.view_carousel,
                    label: 'Banners',
                    route: '/banners',
                    isSelected: selectedRoute == '/banners',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildSectionHeader('Content', isCollapsed, isDark),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.rate_review_outlined,
                    activeIcon: Icons.rate_review,
                    label: 'Reviews',
                    route: '/reviews',
                    isSelected: selectedRoute == '/reviews',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.notifications_outlined,
                    activeIcon: Icons.notifications,
                    label: 'Notifications',
                    route: '/notifications',
                    isSelected: selectedRoute == '/notifications',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildSectionHeader('Analytics & Reports', isCollapsed, isDark),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.analytics_outlined,
                    activeIcon: Icons.analytics,
                    label: 'Analytics',
                    route: '/analytics',
                    isSelected: selectedRoute == '/analytics',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.assessment_outlined,
                    activeIcon: Icons.assessment,
                    label: 'Reports',
                    route: '/reports',
                    isSelected: selectedRoute == '/reports',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildSectionHeader('System', isCollapsed, isDark),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.settings_outlined,
                    activeIcon: Icons.settings,
                    label: 'Settings',
                    route: '/settings',
                    isSelected: selectedRoute == '/settings',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.history_outlined,
                    activeIcon: Icons.history,
                    label: 'Audit Log',
                    route: '/audit-log',
                    isSelected: selectedRoute == '/audit-log',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                  _buildMenuItem(
                    context: context,
                    ref: ref,
                    icon: Icons.admin_panel_settings_outlined,
                    activeIcon: Icons.admin_panel_settings,
                    label: 'Users',
                    route: '/users',
                    isSelected: selectedRoute == '/users',
                    isCollapsed: isCollapsed,
                    isDark: isDark,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogo(bool isCollapsed, bool isDark) {
    return Container(
      height: AppConstants.headerHeight,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.local_pharmacy,
              color: Colors.white,
              size: 22,
            ),
          ),
          if (!isCollapsed) ...[
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'PharmaWorld',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isCollapsed, bool isDark) {
    if (isCollapsed) return const SizedBox(height: 16);

    return Padding(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 4),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1,
          color: isDark ? Colors.white38 : Colors.grey.shade500,
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required BuildContext context,
    required WidgetRef ref,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required String route,
    required bool isSelected,
    required bool isCollapsed,
    required bool isDark,
  }) {
    final color = isSelected
        ? AppColors.primaryLight
        : isDark
            ? Colors.white70
            : Colors.black54;

    return Tooltip(
      message: isCollapsed ? label : '',
      child: ListTile(
        leading: Icon(
          isSelected ? activeIcon : icon,
          color: color,
          size: 22,
        ),
        title: isCollapsed
            ? null
            : Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: color,
                ),
                overflow: TextOverflow.ellipsis,
              ),
        selected: isSelected,
        selectedTileColor: isDark
            ? AppColors.sidebarSelectedDark.withOpacity(0.2)
            : AppColors.sidebarSelectedLight,
        contentPadding: isCollapsed
            ? const EdgeInsets.symmetric(horizontal: 0)
            : const EdgeInsets.symmetric(horizontal: 12),
        visualDensity: const VisualDensity(vertical: -1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        onTap: () {
          ref.read(selectedMenuProvider.notifier).state = route;
          context.go(route);
          if (isMobile) {
            Navigator.of(context).pop();
          }
        },
      ),
    );
  }
}

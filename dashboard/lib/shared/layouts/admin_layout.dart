import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/sidebar.dart';
import 'package:pharmaworld_dashboard/shared/widgets/header.dart';
import 'package:pharmaworld_dashboard/shared/providers/sidebar_provider.dart';
import 'package:pharmaworld_dashboard/core/constants/app_constants.dart';

class AdminLayout extends ConsumerWidget {
  final Widget child;

  const AdminLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isCollapsed = ref.watch(sidebarCollapsedProvider);
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < AppConstants.mobileBreakpoint;
    final isTablet = screenWidth >= AppConstants.mobileBreakpoint &&
        screenWidth < AppConstants.tabletBreakpoint;

    if (isMobile) {
      return _MobileLayout(child: child);
    }

    return Scaffold(
      body: Row(
        children: [
          Sidebar(
            isCollapsed: isTablet ? true : isCollapsed,
          ),
          Expanded(
            child: Column(
              children: [
                const Header(),
                Expanded(
                  child: Container(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    padding: EdgeInsets.all(
                      isTablet ? 12 : 24,
                    ),
                    child: child,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MobileLayout extends ConsumerWidget {
  final Widget child;

  const _MobileLayout({required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PharmaWorld'),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () {
              Scaffold.of(context).openEndDrawer();
            },
          ),
        ],
      ),
      endDrawer: const Drawer(
        child: Sidebar(isMobile: true),
      ),
      body: child,
    );
  }
}

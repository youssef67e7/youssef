import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/sidebar.dart';
import '../widgets/header.dart';

class SuperAdminLayout extends ConsumerWidget {
  final Widget child;

  const SuperAdminLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentPath = GoRouterState.of(context).matchedLocation;
    final title = _getTitle(currentPath);

    return Scaffold(
      body: Row(
        children: [
          const Sidebar(),
          Expanded(
            child: Column(
              children: [
                Header(title: title),
                Expanded(
                  child: Container(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: child,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getTitle(String path) {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/pharmacies': return 'Pharmacies';
      case '/users': return 'Users';
      case '/roles': return 'Roles & Permissions';
      case '/system-health': return 'System Health';
      case '/feature-flags': return 'Feature Flags';
      case '/maintenance': return 'Maintenance';
      case '/config': return 'Configuration';
      case '/audit': return 'Audit Logs';
      case '/analytics': return 'Analytics';
      case '/reports': return 'Reports';
      default: return 'Super Admin';
    }
  }
}

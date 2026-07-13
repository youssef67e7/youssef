import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/providers/auth_provider.dart';
import '../../shared/layouts/super_admin_layout.dart';
import '../../shared/layouts/auth_layout.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/pharmacies/presentation/pages/pharmacies_page.dart';
import '../../features/users/presentation/pages/users_page.dart';
import '../../features/roles_permissions/presentation/pages/roles_page.dart';
import '../../features/system_health/presentation/pages/system_health_page.dart';
import '../../features/feature_flags/presentation/pages/feature_flags_page.dart';
import '../../features/maintenance/presentation/pages/maintenance_page.dart';
import '../../features/config/presentation/pages/config_page.dart';
import '../../features/audit/presentation/pages/audit_page.dart';
import '../../features/analytics/presentation/pages/analytics_page.dart';
import '../../features/reports/presentation/pages/reports_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState.isLoggedIn;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const AuthLayout(child: LoginPage()),
      ),
      ShellRoute(
        builder: (context, state, child) => SuperAdminLayout(child: child),
        routes: [
          GoRoute(path: '/dashboard', builder: (context, state) => const DashboardPage()),
          GoRoute(path: '/pharmacies', builder: (context, state) => const PharmaciesPage()),
          GoRoute(path: '/users', builder: (context, state) => const UsersPage()),
          GoRoute(path: '/roles', builder: (context, state) => const RolesPage()),
          GoRoute(path: '/system-health', builder: (context, state) => const SystemHealthPage()),
          GoRoute(path: '/feature-flags', builder: (context, state) => const FeatureFlagsPage()),
          GoRoute(path: '/maintenance', builder: (context, state) => const MaintenancePage()),
          GoRoute(path: '/config', builder: (context, state) => const ConfigPage()),
          GoRoute(path: '/audit', builder: (context, state) => const AuditPage()),
          GoRoute(path: '/analytics', builder: (context, state) => const AnalyticsPage()),
          GoRoute(path: '/reports', builder: (context, state) => const ReportsPage()),
        ],
      ),
    ],
  );
});

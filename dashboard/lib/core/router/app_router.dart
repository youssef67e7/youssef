import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pharmaworld_dashboard/shared/layouts/admin_layout.dart';
import 'package:pharmaworld_dashboard/shared/layouts/auth_layout.dart';
import 'package:pharmaworld_dashboard/features/auth/presentation/pages/login_page.dart';
import 'package:pharmaworld_dashboard/features/dashboard/presentation/pages/dashboard_page.dart';
import 'package:pharmaworld_dashboard/features/medicines/presentation/pages/medicines_page.dart';
import 'package:pharmaworld_dashboard/features/categories/presentation/pages/categories_page.dart';
import 'package:pharmaworld_dashboard/features/brands/presentation/pages/brands_page.dart';
import 'package:pharmaworld_dashboard/features/orders/presentation/pages/orders_page.dart';
import 'package:pharmaworld_dashboard/features/customers/presentation/pages/customers_page.dart';
import 'package:pharmaworld_dashboard/features/drivers/presentation/pages/drivers_page.dart';
import 'package:pharmaworld_dashboard/features/coupons/presentation/pages/coupons_page.dart';
import 'package:pharmaworld_dashboard/features/offers/presentation/pages/offers_page.dart';
import 'package:pharmaworld_dashboard/features/banners/presentation/pages/banners_page.dart';
import 'package:pharmaworld_dashboard/features/reviews/presentation/pages/reviews_page.dart';
import 'package:pharmaworld_dashboard/features/notifications/presentation/pages/notifications_page.dart';
import 'package:pharmaworld_dashboard/features/returns/presentation/pages/returns_page.dart';
import 'package:pharmaworld_dashboard/features/analytics/presentation/pages/analytics_page.dart';
import 'package:pharmaworld_dashboard/features/reports/presentation/pages/reports_page.dart';
import 'package:pharmaworld_dashboard/features/audit_log/presentation/pages/audit_log_page.dart';
import 'package:pharmaworld_dashboard/features/settings/presentation/pages/settings_page.dart';
import 'package:pharmaworld_dashboard/features/users/presentation/pages/users_page.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) {
        return '/login';
      }
      if (isLoggedIn && isLoginRoute) {
        return '/dashboard';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const AuthLayout(
          child: LoginPage(),
        ),
      ),
      ShellRoute(
        builder: (context, state, child) => AdminLayout(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          GoRoute(
            path: '/medicines',
            builder: (context, state) => const MedicinesPage(),
          ),
          GoRoute(
            path: '/categories',
            builder: (context, state) => const CategoriesPage(),
          ),
          GoRoute(
            path: '/brands',
            builder: (context, state) => const BrandsPage(),
          ),
          GoRoute(
            path: '/orders',
            builder: (context, state) => const OrdersPage(),
          ),
          GoRoute(
            path: '/customers',
            builder: (context, state) => const CustomersPage(),
          ),
          GoRoute(
            path: '/drivers',
            builder: (context, state) => const DriversPage(),
          ),
          GoRoute(
            path: '/coupons',
            builder: (context, state) => const CouponsPage(),
          ),
          GoRoute(
            path: '/offers',
            builder: (context, state) => const OffersPage(),
          ),
          GoRoute(
            path: '/banners',
            builder: (context, state) => const BannersPage(),
          ),
          GoRoute(
            path: '/reviews',
            builder: (context, state) => const ReviewsPage(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationsPage(),
          ),
          GoRoute(
            path: '/returns',
            builder: (context, state) => const ReturnsPage(),
          ),
          GoRoute(
            path: '/analytics',
            builder: (context, state) => const AnalyticsPage(),
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const ReportsPage(),
          ),
          GoRoute(
            path: '/audit-log',
            builder: (context, state) => const AuditLogPage(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsPage(),
          ),
          GoRoute(
            path: '/users',
            builder: (context, state) => const UsersPage(),
          ),
        ],
      ),
    ],
  );
});

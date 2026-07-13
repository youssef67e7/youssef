import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pharmaworld_driver/features/auth/pages/login_page.dart';
import 'package:pharmaworld_driver/features/auth/pages/otp_page.dart';
import 'package:pharmaworld_driver/features/home/pages/home_page.dart';
import 'package:pharmaworld_driver/features/deliveries/pages/active_delivery_page.dart';
import 'package:pharmaworld_driver/features/deliveries/pages/delivery_queue_page.dart';
import 'package:pharmaworld_driver/features/deliveries/pages/completed_deliveries_page.dart';
import 'package:pharmaworld_driver/features/deliveries/pages/delivery_detail_page.dart';
import 'package:pharmaworld_driver/features/orders/pages/order_detail_page.dart';
import 'package:pharmaworld_driver/features/earnings/pages/earnings_page.dart';
import 'package:pharmaworld_driver/features/profile/pages/profile_page.dart';
import 'package:pharmaworld_driver/features/profile/pages/edit_profile_page.dart';
import 'package:pharmaworld_driver/features/navigation/pages/navigation_page.dart';
import 'package:pharmaworld_driver/features/settings/pages/settings_page.dart';
import 'package:pharmaworld_driver/shared/layouts/driver_layout.dart';
import 'package:pharmaworld_driver/shared/providers/auth_provider.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull != null;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation.startsWith('/otp');

      if (!isLoggedIn && !isAuthRoute) {
        return '/login';
      }
      if (isLoggedIn && isAuthRoute) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/otp',
        builder: (context, state) {
          final phone = state.uri.queryParameters['phone'] ?? '';
          return OtpPage(phone: phone);
        },
      ),
      ShellRoute(
        builder: (context, state, child) => DriverLayout(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/deliveries',
            builder: (context, state) => const DeliveryQueuePage(),
          ),
          GoRoute(
            path: '/deliveries/active',
            builder: (context, state) => const ActiveDeliveryPage(),
          ),
          GoRoute(
            path: '/deliveries/completed',
            builder: (context, state) => const CompletedDeliveriesPage(),
          ),
          GoRoute(
            path: '/deliveries/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return DeliveryDetailPage(deliveryId: id);
            },
          ),
          GoRoute(
            path: '/orders/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return OrderDetailPage(orderId: id);
            },
          ),
          GoRoute(
            path: '/earnings',
            builder: (context, state) => const EarningsPage(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePage(),
          ),
          GoRoute(
            path: '/profile/edit',
            builder: (context, state) => const EditProfilePage(),
          ),
          GoRoute(
            path: '/navigation/:lat/:lng',
            builder: (context, state) {
              final lat = double.parse(state.pathParameters['lat']!);
              final lng = double.parse(state.pathParameters['lng']!);
              final title = state.uri.queryParameters['title'] ?? '';
              return NavigationPage(latitude: lat, longitude: lng, title: title);
            },
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsPage(),
          ),
        ],
      ),
    ],
  );
});

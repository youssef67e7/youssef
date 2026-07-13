import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:pharmaworld/features/addresses/presentation/pages/add_address_page.dart';
import 'package:pharmaworld/features/addresses/presentation/pages/addresses_page.dart';
import 'package:pharmaworld/features/addresses/presentation/pages/edit_address_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/forgot_password_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/login_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/onboarding_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/otp_verification_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/register_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/reset_password_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/splash_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/verify_email_page.dart';
import 'package:pharmaworld/features/auth/presentation/pages/verify_phone_page.dart';
import 'package:pharmaworld/features/cart/presentation/pages/cart_page.dart';
import 'package:pharmaworld/features/categories/presentation/pages/categories_page.dart';
import 'package:pharmaworld/features/categories/presentation/pages/category_detail_page.dart';
import 'package:pharmaworld/features/checkout/presentation/pages/checkout_page.dart';
import 'package:pharmaworld/features/coupons/presentation/pages/coupons_page.dart';
import 'package:pharmaworld/features/home/presentation/pages/home_page.dart';
import 'package:pharmaworld/features/loyalty/presentation/pages/loyalty_page.dart';
import 'package:pharmaworld/features/medicines/presentation/pages/barcode_scanner_page.dart';
import 'package:pharmaworld/features/medicines/presentation/pages/medicine_detail_page.dart';
import 'package:pharmaworld/features/medicines/presentation/pages/medicines_page.dart';
import 'package:pharmaworld/features/medicines/presentation/pages/search_page.dart';
import 'package:pharmaworld/features/notifications/presentation/pages/notifications_page.dart';
import 'package:pharmaworld/features/orders/presentation/pages/order_detail_page.dart';
import 'package:pharmaworld/features/orders/presentation/pages/order_tracking_page.dart';
import 'package:pharmaworld/features/orders/presentation/pages/orders_page.dart';
import 'package:pharmaworld/features/profile/presentation/pages/change_password_page.dart';
import 'package:pharmaworld/features/profile/presentation/pages/edit_profile_page.dart';
import 'package:pharmaworld/features/profile/presentation/pages/profile_page.dart';
import 'package:pharmaworld/features/referral/presentation/pages/referral_page.dart';
import 'package:pharmaworld/features/reviews/presentation/pages/edit_review_page.dart';
import 'package:pharmaworld/features/reviews/presentation/pages/my_reviews_page.dart';
import 'package:pharmaworld/features/reviews/presentation/pages/reviews_page.dart';
import 'package:pharmaworld/features/reviews/presentation/pages/write_review_page.dart';
import 'package:pharmaworld/features/settings/presentation/pages/settings_about_page.dart';
import 'package:pharmaworld/features/settings/presentation/pages/settings_page.dart';
import 'package:pharmaworld/features/settings/presentation/pages/settings_privacy_page.dart';
import 'package:pharmaworld/features/settings/presentation/pages/settings_terms_page.dart';
import 'package:pharmaworld/features/support/presentation/pages/support_page.dart';
import 'package:pharmaworld/features/support/presentation/pages/ticket_detail_page.dart';
import 'package:pharmaworld/features/wallet/presentation/pages/wallet_page.dart';
import 'package:pharmaworld/features/wishlist/presentation/pages/wishlist_page.dart';
import 'package:pharmaworld/shared/providers/auth_provider.dart';
import 'package:pharmaworld/shared/widgets/bottom_nav.dart';
import 'package:pharmaworld/core/router/route_names.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: RouteNames.splash,
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final authValue = authState.valueOrNull;
      if (authValue == null) return null;
      final isLoggedIn = authValue;
      final isOnAuthRoute = state.matchedLocation == RouteNames.splash ||
          state.matchedLocation == RouteNames.onboarding ||
          state.matchedLocation == RouteNames.login ||
          state.matchedLocation == RouteNames.register ||
          state.matchedLocation == RouteNames.forgotPassword ||
          state.matchedLocation == RouteNames.resetPassword;

      if (!isLoggedIn && !isOnAuthRoute) {
        return RouteNames.login;
      }

      if (isLoggedIn && isOnAuthRoute) {
        return RouteNames.home;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: RouteNames.splash,
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: RouteNames.onboarding,
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: RouteNames.login,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: RouteNames.register,
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: RouteNames.forgotPassword,
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      GoRoute(
        path: RouteNames.resetPassword,
        builder: (context, state) => const ResetPasswordPage(),
      ),
      GoRoute(
        path: RouteNames.verifyEmail,
        builder: (context, state) => const VerifyEmailPage(),
      ),
      GoRoute(
        path: RouteNames.verifyPhone,
        builder: (context, state) => const VerifyPhonePage(),
      ),
      GoRoute(
        path: RouteNames.otpVerification,
        builder: (context, state) => const OtpVerificationPage(),
      ),
      ShellRoute(
        builder: (context, state, child) {
          return MainShell(child: child);
        },
        routes: [
          GoRoute(
            path: RouteNames.home,
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: RouteNames.categories,
            builder: (context, state) => const CategoriesPage(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) => CategoryDetailPage(
                  categoryId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: RouteNames.cart,
            builder: (context, state) => const CartPage(),
          ),
          GoRoute(
            path: RouteNames.profile,
            builder: (context, state) => const ProfilePage(),
          ),
        ],
      ),
      GoRoute(
        path: RouteNames.medicines,
        builder: (context, state) => const MedicinesPage(),
      ),
      GoRoute(
        path: RouteNames.medicineSearch,
        builder: (context, state) => const SearchPage(),
      ),
      GoRoute(
        path: RouteNames.medicineDetail,
        builder: (context, state) => MedicineDetailPage(
          medicineId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: RouteNames.barcodeScanner,
        builder: (context, state) => const BarcodeScannerPage(),
      ),
      GoRoute(
        path: RouteNames.medicineByBarcode,
        builder: (context, state) => const BarcodeScannerPage(),
      ),
      GoRoute(
        path: RouteNames.checkout,
        builder: (context, state) => const CheckoutPage(),
      ),
      GoRoute(
        path: RouteNames.orders,
        builder: (context, state) => const OrdersPage(),
      ),
      GoRoute(
        path: RouteNames.orderDetail,
        builder: (context, state) => OrderDetailPage(
          orderId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: RouteNames.orderTracking,
        builder: (context, state) => OrderTrackingPage(
          orderId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: RouteNames.wishlist,
        builder: (context, state) => const WishlistPage(),
      ),
      GoRoute(
        path: RouteNames.editProfile,
        builder: (context, state) => const EditProfilePage(),
      ),
      GoRoute(
        path: RouteNames.changePassword,
        builder: (context, state) => const ChangePasswordPage(),
      ),
      GoRoute(
        path: RouteNames.addresses,
        builder: (context, state) => const AddressesPage(),
      ),
      GoRoute(
        path: RouteNames.addAddress,
        builder: (context, state) => const AddAddressPage(),
      ),
      GoRoute(
        path: RouteNames.editAddress,
        builder: (context, state) => EditAddressPage(
          addressId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: RouteNames.notifications,
        builder: (context, state) => const NotificationsPage(),
      ),
      GoRoute(
        path: RouteNames.wallet,
        builder: (context, state) => const WalletPage(),
      ),
      GoRoute(
        path: RouteNames.coupons,
        builder: (context, state) => const CouponsPage(),
      ),
      GoRoute(
        path: RouteNames.myCoupons,
        builder: (context, state) => const CouponsPage(),
      ),
      GoRoute(
        path: RouteNames.reviews,
        builder: (context, state) => const ReviewsPage(),
      ),
      GoRoute(
        path: RouteNames.writeReview,
        builder: (context, state) => WriteReviewPage(
          medicineId: state.pathParameters['medicineId']!,
        ),
      ),
      GoRoute(
        path: RouteNames.editReview,
        builder: (context, state) => EditReviewPage(
          reviewId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: RouteNames.myReviews,
        builder: (context, state) => const MyReviewsPage(),
      ),
      GoRoute(
        path: RouteNames.loyalty,
        builder: (context, state) => const LoyaltyPage(),
      ),
      GoRoute(
        path: RouteNames.referral,
        builder: (context, state) => const ReferralPage(),
      ),
      GoRoute(
        path: RouteNames.support,
        builder: (context, state) => const SupportPage(),
      ),
      GoRoute(
        path: RouteNames.createTicket,
        builder: (context, state) => const SupportPage(),
      ),
      GoRoute(
        path: RouteNames.ticketDetail,
        builder: (context, state) => TicketDetailPage(
          ticketId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: RouteNames.settings,
        builder: (context, state) => const SettingsPage(),
      ),
      GoRoute(
        path: RouteNames.about,
        builder: (context, state) => const SettingsAboutPage(),
      ),
      GoRoute(
        path: RouteNames.privacyPolicy,
        builder: (context, state) => const SettingsPrivacyPage(),
      ),
      GoRoute(
        path: RouteNames.termsOfService,
        builder: (context, state) => const SettingsTermsPage(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              state.error?.toString() ?? 'Unknown error',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(RouteNames.home),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    int currentIndex = 0;
    if (location.startsWith(RouteNames.categories)) {
      currentIndex = 1;
    } else if (location.startsWith(RouteNames.cart)) {
      currentIndex = 2;
    } else if (location.startsWith(RouteNames.profile)) {
      currentIndex = 3;
    }

    return BottomNav(
      currentIndex: currentIndex,
      child: child,
    );
  }
}

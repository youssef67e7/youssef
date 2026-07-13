import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';

class BottomNav extends StatelessWidget {
  final Widget child;

  const BottomNav({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return child;
  }
}

class DriverBottomNav extends StatelessWidget {
  final int currentIndex;

  const DriverBottomNav({
    super.key,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: (index) {
        switch (index) {
          case 0:
            context.go('/home');
            break;
          case 1:
            context.go('/deliveries');
            break;
          case 2:
            context.go('/earnings');
            break;
          case 3:
            context.go('/profile');
            break;
        }
      },
      items: [
        BottomNavigationBarItem(
          icon: const Icon(Icons.home_outlined),
          activeIcon: const Icon(Icons.home),
          label: l10n?.home ?? 'Home',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.local_shipping_outlined),
          activeIcon: const Icon(Icons.local_shipping),
          label: l10n?.deliveries ?? 'Deliveries',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.attach_money_outlined),
          activeIcon: const Icon(Icons.attach_money),
          label: l10n?.earnings ?? 'Earnings',
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.person_outlined),
          activeIcon: const Icon(Icons.person),
          label: l10n?.profile ?? 'Profile',
        ),
      ],
    );
  }
}

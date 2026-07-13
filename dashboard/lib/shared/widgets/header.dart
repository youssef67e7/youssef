import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/theme_provider.dart';
import 'package:pharmaworld_dashboard/shared/providers/locale_provider.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/providers/sidebar_provider.dart';
import 'package:pharmaworld_dashboard/core/constants/app_constants.dart';

class Header extends ConsumerWidget {
  const Header({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isCollapsed = ref.watch(sidebarCollapsedProvider);
    final authState = ref.watch(authProvider);
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth >= AppConstants.mobileBreakpoint &&
        screenWidth < AppConstants.tabletBreakpoint;

    return Container(
      height: AppConstants.headerHeight,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        border: Border(
          bottom: BorderSide(
            color: isDark ? Colors.white12 : Colors.grey.shade200,
          ),
        ),
      ),
      child: Row(
        children: [
          if (isTablet || !isCollapsed)
            IconButton(
              icon: Icon(
                isCollapsed ? Icons.menu : Icons.menu_open,
              ),
              onPressed: () {
                ref.read(sidebarCollapsedProvider.notifier).state =
                    !isCollapsed;
              },
            ),
          if (isTablet)
            const SizedBox(width: 8),
          Expanded(
            child: _buildSearchBar(context),
          ),
          const SizedBox(width: 16),
          _buildLanguageToggle(ref),
          const SizedBox(width: 8),
          _buildThemeToggle(ref, isDark),
          const SizedBox(width: 8),
          _buildNotificationButton(context),
          const SizedBox(width: 8),
          _buildProfileMenu(context, ref, authState),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 400),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search...',
          prefixIcon: const Icon(Icons.search, size: 20),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Theme.of(context).brightness == Brightness.dark
              ? Colors.white10
              : Colors.grey.shade100,
        ),
      ),
    );
  }

  Widget _buildLanguageToggle(WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    final isArabic = locale.languageCode == 'ar';

    return IconButton(
      icon: Text(
        isArabic ? 'EN' : 'ع',
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
      ),
      tooltip: isArabic ? 'Switch to English' : 'التبديل إلى العربية',
      onPressed: () {
        ref.read(localeProvider.notifier).toggleLocale();
      },
    );
  }

  Widget _buildThemeToggle(WidgetRef ref, bool isDark) {
    return IconButton(
      icon: Icon(
        isDark ? Icons.light_mode : Icons.dark_mode,
        size: 22,
      ),
      tooltip: isDark ? 'Light Mode' : 'Dark Mode',
      onPressed: () {
        ref.read(themeModeProvider.notifier).toggleTheme();
      },
    );
  }

  Widget _buildNotificationButton(BuildContext context) {
    return Stack(
      children: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined, size: 22),
          onPressed: () {
            // Show notifications
          },
        ),
        Positioned(
          right: 8,
          top: 8,
          child: Container(
            width: 16,
            height: 16,
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Text(
                '3',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProfileMenu(
      BuildContext context, WidgetRef ref, AuthState authState) {
    return PopupMenuButton<String>(
      offset: const Offset(0, 40),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: Theme.of(context).colorScheme.primary,
            child: Text(
              authState.user?.initials ?? 'A',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                authState.user?.name ?? 'Admin',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                authState.user?.email ?? 'admin@pharmaworld.com',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey.shade500,
                ),
              ),
            ],
          ),
          const SizedBox(width: 4),
          const Icon(Icons.arrow_drop_down, size: 18),
        ],
      ),
      itemBuilder: (context) => [
        const PopupMenuItem<String>(
          value: 'profile',
          child: Row(
            children: [
              Icon(Icons.person_outline, size: 18),
              SizedBox(width: 8),
              Text('Profile'),
            ],
          ),
        ),
        const PopupMenuItem<String>(
          value: 'settings',
          child: Row(
            children: [
              Icon(Icons.settings_outlined, size: 18),
              SizedBox(width: 8),
              Text('Settings'),
            ],
          ),
        ),
        const PopupMenuDivider(),
        PopupMenuItem<String>(
          value: 'logout',
          child: Row(
            children: [
              Icon(Icons.logout, size: 18, color: Colors.red.shade400),
              const SizedBox(width: 8),
              Text('Logout', style: TextStyle(color: Colors.red.shade400)),
            ],
          ),
        ),
      ],
      onSelected: (value) {
        if (value == 'logout') {
          ref.read(authProvider.notifier).logout();
        }
      },
    );
  }
}

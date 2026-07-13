import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/colors.dart';
import '../../core/localization/app_localizations.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../providers/locale_provider.dart';

class Sidebar extends ConsumerStatefulWidget {
  const Sidebar({super.key});

  @override
  ConsumerState<Sidebar> createState() => _SidebarState();
}

class _SidebarState extends ConsumerState<Sidebar> {
  bool _isCollapsed = false;
  String _hoveredItem = '';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentPath = GoRouterState.of(context).matchedLocation;
    final isDark = theme.brightness == Brightness.dark;
    final loc = AppLocalizations.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: _isCollapsed ? 72 : 280,
      decoration: BoxDecoration(
        color: isDark ? AppColors.sidebarDark : AppColors.sidebarLight,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 8, offset: const Offset(2, 0))],
      ),
      child: Column(
        children: [
          _buildLogo(isDark),
          const Divider(color: Colors.white24, height: 1),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSection(loc.translate('systemOverview'), [
                    _SidebarItem(Icons.dashboard, loc.translate('dashboard'), '/dashboard'),
                  ], currentPath, isDark),
                  _buildSection(loc.translate('userManagement'), [
                    _SidebarItem(Icons.local_pharmacy, loc.translate('pharmacies'), '/pharmacies'),
                    _SidebarItem(Icons.people, loc.translate('users'), '/users'),
                    _SidebarItem(Icons.admin_panel_settings, loc.translate('roles'), '/roles'),
                  ], currentPath, isDark),
                  _buildSection(loc.translate('operations'), [
                    _SidebarItem(Icons.health_and_safety, loc.translate('systemHealth'), '/system-health'),
                    _SidebarItem(Icons.flag, loc.translate('featureFlags'), '/feature-flags'),
                    _SidebarItem(Icons.build, loc.translate('maintenance'), '/maintenance'),
                  ], currentPath, isDark),
                  _buildSection(loc.translate('analyticsSection'), [
                    _SidebarItem(Icons.analytics, loc.translate('analytics'), '/analytics'),
                    _SidebarItem(Icons.assessment, loc.translate('reports'), '/reports'),
                  ], currentPath, isDark),
                  _buildSection(loc.translate('security'), [
                    _SidebarItem(Icons.shield, loc.translate('auditLogs'), '/audit'),
                  ], currentPath, isDark),
                  _buildSection(loc.translate('configuration'), [
                    _SidebarItem(Icons.settings, loc.translate('config'), '/config'),
                  ], currentPath, isDark),
                ],
              ),
            ),
          ),
          _buildBottomActions(isDark, loc),
        ],
      ),
    );
  }

  Widget _buildLogo(bool isDark) {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.local_pharmacy, color: Colors.white, size: 24),
          ),
          if (!_isCollapsed) ...[
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('PharmaWorld', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('Super Admin', style: TextStyle(color: Colors.white70, fontSize: 11)),
                ],
              ),
            ),
          ],
          IconButton(
            icon: Icon(_isCollapsed ? Icons.chevron_right : Icons.chevron_left, color: Colors.white70),
            onPressed: () => setState(() => _isCollapsed = !_isCollapsed),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<_SidebarItem> items, String currentPath, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!_isCollapsed)
          Padding(
            padding: const EdgeInsets.only(left: 16, top: 16, bottom: 4),
            child: Text(title.toUpperCase(), style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1)),
          ),
        ...items.map((item) => _buildItem(item, currentPath, isDark)),
      ],
    );
  }

  Widget _buildItem(_SidebarItem item, String currentPath, bool isDark) {
    final isActive = currentPath == item.route;
    final isHovered = _hoveredItem == item.route;

    return MouseRegion(
      onEnter: (_) => setState(() => _hoveredItem = item.route),
      onExit: (_) => setState(() => _hoveredItem = ''),
      child: GestureDetector(
        onTap: () => context.go(item.route),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isActive
                ? AppColors.sidebarItemActiveLight.withValues(alpha: 0.8)
                : isHovered
                    ? Colors.white.withValues(alpha: 0.1)
                    : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              Icon(item.icon, color: Colors.white.withValues(alpha: isActive ? 1.0 : 0.7), size: 22),
              if (!_isCollapsed) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(item.label, style: TextStyle(color: Colors.white.withValues(alpha: isActive ? 1.0 : 0.7), fontSize: 14, fontWeight: isActive ? FontWeight.w600 : FontWeight.normal)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomActions(bool isDark, AppLocalizations loc) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: const BoxDecoration(color: Colors.black12),
      child: Column(
        children: [
          _buildBottomAction(Icons.language, loc.translate('settings'), () {
            ref.read(localeProvider.notifier).toggleLocale();
          }),
          _buildBottomAction(
            isDark ? Icons.light_mode : Icons.dark_mode,
            isDark ? 'Light Mode' : 'Dark Mode',
            () => ref.read(themeModeProvider.notifier).toggleTheme(),
          ),
          _buildBottomAction(Icons.logout, loc.translate('logout'), () {
            ref.read(authStateProvider.notifier).logout();
          }),
        ],
      ),
    );
  }

  Widget _buildBottomAction(IconData icon, String label, VoidCallback onTap) {
    return ListTile(
      dense: true,
      leading: Icon(icon, color: Colors.white70, size: 20),
      title: _isCollapsed ? null : Text(label, style: const TextStyle(color: Colors.white70, fontSize: 13)),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    );
  }
}

class _SidebarItem {
  final IconData icon;
  final String label;
  final String route;

  const _SidebarItem(this.icon, this.label, this.route);
}

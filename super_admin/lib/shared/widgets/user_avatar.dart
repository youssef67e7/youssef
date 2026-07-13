import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';

class UserAvatar extends StatelessWidget {
  final String name;
  final String? imageUrl;
  final double size;

  const UserAvatar({super.key, required this.name, this.imageUrl, this.size = 40});

  @override
  Widget build(BuildContext context) {
    final initials = name.split(' ').map((e) => e.isNotEmpty ? e[0] : '').join('').toUpperCase().substring(0, name.split(' ').length.clamp(0, 2));
    final colors = [AppColors.primaryLight, AppColors.secondaryLight, AppColors.accent, const Color(0xFF9C27B0)];
    final color = colors[name.hashCode.abs() % colors.length];

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.15),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Center(
        child: Text(
          initials,
          style: TextStyle(
            color: color,
            fontSize: size * 0.35,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

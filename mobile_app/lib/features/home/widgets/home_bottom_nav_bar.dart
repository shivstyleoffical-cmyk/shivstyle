import 'package:flutter/material.dart';
import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import '../../../core/theme/app_colors.dart';

class HomeBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const HomeBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return CurvedNavigationBar(
      height: 60,
      backgroundColor: Colors.transparent,
      color: Colors.white,
      buttonBackgroundColor: AppColors.primary,
      animationDuration: const Duration(milliseconds: 300),
      items: [
        Icon(Icons.home_filled, color: currentIndex == 0 ? Colors.white : AppColors.accent.withOpacity(0.5)),
        Icon(Icons.widgets_rounded, color: currentIndex == 1 ? Colors.white : AppColors.accent.withOpacity(0.5)),
        Icon(Icons.favorite_rounded, color: currentIndex == 2 ? Colors.white : AppColors.accent.withOpacity(0.5)),
        Icon(Icons.person_rounded, color: currentIndex == 3 ? Colors.white : AppColors.accent.withOpacity(0.5)),
      ],
      onTap: onTap,
    );
  }
}

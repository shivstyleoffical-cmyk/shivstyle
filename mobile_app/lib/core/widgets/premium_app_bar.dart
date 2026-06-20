import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';

class PremiumAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showBackButton;
  final VoidCallback? onBackPress;
  final PreferredSizeWidget? bottom;

  const PremiumAppBar({
    super.key,
    required this.title,
    this.actions,
    this.showBackButton = true,
    this.onBackPress,
    this.bottom,
  });

  @override
  Widget build(BuildContext context) {
    return PreferredSize(
      preferredSize: Size.fromHeight(kToolbarHeight + (bottom != null ? bottom!.preferredSize.height : 10)),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: AppBar(
            backgroundColor: Colors.white.withOpacity(0.85),
            elevation: 0.5,
            centerTitle: true,
            leading: showBackButton
                ? FadeInLeft(
                    duration: const Duration(milliseconds: 500),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded,
                          color: AppColors.accent, size: 20),
                      onPressed: onBackPress ?? () => Navigator.pop(context),
                    ),
                  )
                : null,
            title: FadeInDown(
              duration: const Duration(milliseconds: 600),
              child: Text(
                title.toUpperCase(),
                style: const TextStyle(
                  color: AppColors.accent,
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  letterSpacing: 1.5,
                ),
              ),
            ),
            actions: actions?.map((action) => FadeInRight(
              duration: const Duration(milliseconds: 500),
              child: action,
            )).toList() ?? [],
            bottom: bottom,
          ),
        ),
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight + (bottom != null ? bottom!.preferredSize.height : 10));
}

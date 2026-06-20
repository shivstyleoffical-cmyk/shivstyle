import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../constants/assets.dart';
import '../theme/app_colors.dart';

class AppLoading extends StatelessWidget {
  final double size;
  const AppLoading({super.key, this.size = 60});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Pulse(
            infinite: true,
            duration: const Duration(seconds: 2),
            child: Image.asset(
              AppAssets.logo,
              height: size,
              errorBuilder: (c, e, s) => Icon(Icons.shopping_cart, size: size, color: AppColors.primary),
            ),
          ),
          const SizedBox(height: 20),
          const SizedBox(
            width: 40,
            child: LinearProgressIndicator(
              backgroundColor: Colors.transparent,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              minHeight: 2,
            ),
          ),
        ],
      ),
    );
  }
}

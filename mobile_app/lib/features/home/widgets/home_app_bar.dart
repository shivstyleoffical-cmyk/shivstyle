import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/constants/assets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/cart_provider.dart';
import '../screens/cart_screen.dart';

class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final bool isScrolled;
  const HomeAppBar({super.key, required this.isScrolled});

  @override
  Widget build(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(80),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          color: isScrolled ? Colors.white.withOpacity(0.9) : Colors.transparent,
          boxShadow: isScrolled
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  )
                ]
              : [],
        ),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(
              sigmaX: isScrolled ? 10 : 0,
              sigmaY: isScrolled ? 10 : 0,
            ),
            child: AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              centerTitle: true,
              leadingWidth: 70,
              leading: Center(
                child: FadeInLeft(
                  duration: const Duration(milliseconds: 500),
                  child: Container(
                    margin: const EdgeInsets.only(left: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      onPressed: () => Scaffold.of(context).openDrawer(),
                      icon: const Icon(Icons.menu_rounded, color: AppColors.accent, size: 22),
                    ),
                  ),
                ),
              ),
              title: FadeInDown(
                duration: const Duration(milliseconds: 600),
                child: Hero(
                  tag: 'app_logo',
                  child: Image.asset(
                    AppAssets.logo,
                    height: 35,
                    fit: BoxFit.contain,
                    errorBuilder: (c, e, s) => const Text(
                      "KalimGo",
                      style: TextStyle(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
              ),
              actions: [
                FadeInRight(
                  duration: const Duration(milliseconds: 500),
                  delay: const Duration(milliseconds: 100),
                  child: _buildAppBarAction(
                    icon: Icons.notifications_none_rounded,
                    onTap: () {},
                  ),
                ),
                Consumer<CartProvider>(
                  builder: (context, cart, child) => FadeInRight(
                    duration: const Duration(milliseconds: 500),
                    delay: const Duration(milliseconds: 200),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        _buildAppBarAction(
                          icon: Icons.shopping_bag_outlined,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const CartScreen(),
                                fullscreenDialog: true,
                              ),
                            );
                          },
                        ),
                        if (cart.totalItems > 0)
                          Positioned(
                            right: 12,
                            top: 12,
                            child: BounceInDown(
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                ),
                                constraints: const BoxConstraints(
                                  minWidth: 18,
                                  minHeight: 18,
                                ),
                                child: Text(
                                  "${cart.totalItems}",
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 8,
                                    fontWeight: FontWeight.w900,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAppBarAction({required IconData icon, required VoidCallback onTap}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        onPressed: onTap,
        icon: Icon(icon, color: AppColors.accent, size: 22),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(80);
}

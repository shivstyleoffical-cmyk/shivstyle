import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/assets.dart';
import '../../../core/providers/cart_provider.dart';
import '../../home/screens/profile_screen.dart';
import '../../home/screens/wishlist_screen.dart';
import '../../home/screens/cart_screen.dart';

class ModernHomeHeader extends StatelessWidget {
  final String? userName;
  final VoidCallback onSearchTap;
  final VoidCallback onDrawerTap;
  final VoidCallback onProfileTap;
  final VoidCallback onWishlistTap;

  const ModernHomeHeader({
    super.key,
    required this.userName,
    required this.onSearchTap,
    required this.onDrawerTap,
    required this.onProfileTap,
    required this.onWishlistTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 50, left: 20, right: 20, bottom: 25),
      decoration: const BoxDecoration(
        color: AppColors.accent, // Black background
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: Column(
        children: [
          // 1. Top Row: Menu - Greeting - Cart (Animated)
          FadeInDown(
            duration: const Duration(milliseconds: 600),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Hamburger Menu
                GestureDetector(
                  onTap: onDrawerTap,
                  child: Container(
                    height: 45,
                    width: 45,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(10),
                    child: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
                  ),
                ),
                const SizedBox(width: 15),
                
                // Hello Text
                Expanded(
                  child: Text(
                    userName != null ? "Hello, ${userName!.split(' ').first}" : "Hello, Guest",
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                
                // Notifications & Cart Icons (Right)
                Row(
                  children: [
                    _buildActionButton(
                      icon: Icons.notifications_outlined, 
                      onTap: () {
                        // Navigate to notifications
                      }
                    ),
                    const SizedBox(width: 12),
                    Consumer<CartProvider>(
                      builder: (context, cart, child) => Stack(
                        clipBehavior: Clip.none,
                        children: [
                          _buildActionButton(
                            icon: Icons.shopping_bag_outlined,
                            onTap: () {
                               Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
                            },
                          ),
                          if (cart.totalItems > 0)
                            Positioned(
                              right: -2,
                              top: -2,
                              child: BounceInDown(
                                duration: const Duration(milliseconds: 500),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: AppColors.accent, width: 2),
                                  ),
                                  constraints: const BoxConstraints(
                                    minWidth: 18,
                                    minHeight: 18,
                                  ),
                                  child: Text(
                                    "${cart.totalItems}",
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 5),

          // 2. Center Branding: Logo & Slogan (Animated)
          Column(
            children: [
              // Logo with increased size + Animation
              ElasticIn(
                duration: const Duration(milliseconds: 1000),
                child: Image.asset(
                  AppAssets.logo,
                  height: 100, 
                  width: 240,
                  fit: BoxFit.contain,
                  color: Colors.white,
                  errorBuilder: (c, e, s) => const Text(
                    "KalimGo", 
                    style: TextStyle(color: Colors.white, fontSize: 42, fontWeight: FontWeight.w900, fontFamily: 'serif')
                  ),
                ),
              ),
              const SizedBox(height: 5),
              
              // Enhanced Slogan Design + Animation
              FadeInUp(
                 delay: const Duration(milliseconds: 300),
                 child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primary.withOpacity(0.15),
                          AppColors.primary.withOpacity(0.05),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.8), 
                        width: 1.5
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.25),
                          blurRadius: 15,
                          spreadRadius: -2,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          "SHOP LOCAL, SUPPORT LOCAL", 
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),
              ),
            ],
          ),
          
          const SizedBox(height: 25),
          
          // 3. Search Bar (Animated)
          FadeInUp(
            delay: const Duration(milliseconds: 600),
            child: Container(
              height: 55,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                   const Icon(Icons.search, color: Colors.grey, size: 24),
                   const SizedBox(width: 12),
                   Expanded(
                     child: TextField(
                       readOnly: true,
                       onTap: onSearchTap,
                       style: const TextStyle(
                         fontSize: 15,
                         fontWeight: FontWeight.w600,
                         color: Colors.black87
                       ),
                       decoration: const InputDecoration(
                         hintText: "Search for products",
                         hintStyle: TextStyle(
                           color: Colors.grey,
                           fontSize: 15,
                           fontWeight: FontWeight.w400,
                         ),
                         border: InputBorder.none,
                         contentPadding: EdgeInsets.zero,
                         isDense: true,
                       ),
                     ),
                   ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({required IconData icon, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 45,
        width: 45,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    );
  }
}

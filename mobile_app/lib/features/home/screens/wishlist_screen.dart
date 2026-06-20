import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/wishlist_provider.dart';
import '../widgets/product_card.dart';
import 'product_details_screen.dart';
import 'home_screen.dart';

class WishlistScreen extends StatelessWidget {
  final bool isTab;
  const WishlistScreen({super.key, this.isTab = false});

  @override
  Widget build(BuildContext context) {
    final body = Consumer<WishlistProvider>(
      builder: (context, wishlist, child) {
        if (wishlist.items.isEmpty) {
          return _buildEmptyState(context);
        }

        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 0.65,
          ),
          itemCount: wishlist.items.length,
          itemBuilder: (context, index) {
            final product = wishlist.items[index];
            return FadeInUp(
              delay: Duration(milliseconds: index * 50),
              child: ProductCard(
                product: product,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ProductDetailsScreen(product: product),
                    ),
                  );
                },
              ),
            );
          },
        );
      },
    );

    if (isTab) return body;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text(
          'My Wishlist',
          style: TextStyle(
            color: AppColors.accent, 
            fontWeight: FontWeight.w900,
            fontSize: 16,
            letterSpacing: 1,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(
            Navigator.canPop(context) ? Icons.arrow_back_ios_rounded : Icons.menu_rounded,
            color: AppColors.accent,
          ),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            } else {
              Scaffold.of(context).openDrawer();
            }
          },
        ),
      ),
      body: body,
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.favorite_outline_rounded, size: 100, color: Colors.grey[200]),
          const SizedBox(height: 24),
          const Text(
            'Your wishlist is empty',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.accent),
          ),
          const SizedBox(height: 12),
          Text(
            'Save items you love here to shop later.',
            style: TextStyle(color: Colors.grey[500]),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: 200,
            height: 50,
            child: ElevatedButton(
              onPressed: () {
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                } else {
                  // If in tab, we could theoretically use a global key to switch tabs, 
                  // but a simple pop is safer for most navigation flows.
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const HomeScreen()),
                    (route) => false,
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('START SHOPPING', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'core/theme/app_colors.dart';
import 'core/constants/assets.dart';
import 'features/auth/screens/phone_auth_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

 final List<OnboardingItem> _items = [
  OnboardingItem(
    title: "Discover Latest\nFashion Trends",
    description:
        "Explore unique fashion crafted locally by Kalimgo, blending modern style with authentic local craftsmanship.",
    imagePath: AppAssets.promoSale,
  ),
  OnboardingItem(
    title: "Fast & Reliable\nExpress Delivery",
    description:
        "Proudly made locally and delivered with care—bringing Kalimgo products straight from our community to your doorstep.",
    imagePath: AppAssets.promoDelivery,
  ),
  OnboardingItem(
    title: "Premium Quality\nYou Can Trust",
    description:
        "Experience premium quality from Kalimgo, a locally made brand focused on durability, comfort, and trust.",
    imagePath: AppAssets.promoReady,
  ),
];


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F4F9),
      body: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            itemCount: _items.length,
            onPageChanged: (index) {
              setState(() => _currentPage = index);
            },
            itemBuilder: (context, index) {
              return _buildPage(_items[index]);
            },
          ),
          
          Positioned(
            bottom: 50,
            left: 30,
            right: 30,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // SKIP Text
                TextButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                    );
                  },
                  child: const Text(
                    "SKIP",
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
                
                // NEXT / START Button
                GestureDetector(
                  onTap: () {
                    if (_currentPage < _items.length - 1) {
                      _controller.nextPage(
                        duration: const Duration(milliseconds: 500),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const LoginScreen()),
                      );
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _currentPage == _items.length - 1 ? "START" : "NEXT",
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPage(OnboardingItem item) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Illustration in a circle background
          FadeInDown(
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: ClipOval(
                child: Image.asset(
                  item.imagePath,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return const Icon(Icons.image_outlined, size: 100, color: AppColors.primary);
                  },
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 60),
          
          // Dots Indicator
          FadeIn(
            delay: const Duration(milliseconds: 400),
            child: SmoothPageIndicator(
              controller: _controller,
              count: _items.length,
              effect: const ScrollingDotsEffect(
                activeDotColor: Colors.black,
                dotColor: Colors.black12,
                dotHeight: 8,
                dotWidth: 8,
                spacing: 8,
              ),
            ),
          ),
          
          const SizedBox(height: 48),
          
          // Title
          FadeInUp(
            child: Text(
              item.title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: Colors.black,
                height: 1.2,
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Description
          FadeInUp(
            delay: const Duration(milliseconds: 200),
            child: Text(
              item.description,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
                fontWeight: FontWeight.w400,
                height: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 100), // Reserve space for buttons
        ],
      ),
    );
  }
}

class OnboardingItem {
  final String title;
  final String description;
  final String imagePath;

  OnboardingItem({
    required this.title,
    required this.description,
    required this.imagePath,
  });
}

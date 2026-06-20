import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/home/screens/home_screen.dart';
import '../../core/constants/assets.dart';
import '../../core/theme/app_colors.dart';
import '../../core/services/location_service.dart';
import '../../onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _navigateToNext();
    });
  }

  _navigateToNext() async {
    try {
      await Future.delayed(const Duration(seconds: 3));
      if (!mounted) return;

      // Safe location check
      try {
        bool hasLoc = await LocationService.hasPermission();
        if (!hasLoc) {
          await LocationService.forceRequestPermission(context).timeout(const Duration(seconds: 5));
        }
      } catch (e) {
        debugPrint("Location service timeout or error: $e");
      }

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final userDataStr = prefs.getString('user_data');

      Widget nextScreen;
      if (token != null && token.isNotEmpty) {
        String? name;
        if (userDataStr != null) {
          try {
            final userData = jsonDecode(userDataStr);
            name = userData['name'];
          } catch (e) {
            debugPrint("Error decoding user data: $e");
          }
        }
        nextScreen = HomeScreen(userName: name);
      } else {
        nextScreen = const OnboardingScreen();
      }

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => nextScreen),
        );
      }
    } catch (e) {
      debugPrint("Fatal error in SplashScreen: $e");
      // Fallback to onboarding if anything goes wrong
      if (mounted) {
        Navigator.pushReplacement(
          context, 
          MaterialPageRoute(builder: (context) => const OnboardingScreen())
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FadeInDown(
                  duration: const Duration(milliseconds: 1000),
                  child: Hero(
                    tag: 'app_logo',
                    child: Image.asset(
                      AppAssets.logo,
                      width: 300, // Increased size
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
                const SizedBox(height: 30),
                FadeInUp(
                  delay: const Duration(milliseconds: 500),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: AppColors.primary.withOpacity(0.3), width: 1),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'SHOP LOCAL, SUPPORT LOCAL',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Center(
              child: FadeIn(
                delay: const Duration(seconds: 1),
                child: const SizedBox(
                  width: 40,
                  height: 40,
                  child: CircularProgressIndicator(
                    color: AppColors.primary,
                    strokeWidth: 2,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

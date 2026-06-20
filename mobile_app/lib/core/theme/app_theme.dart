import 'package:flutter/material.dart';
import './app_colors.dart';

class AppTheme {
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: Colors.white,
      primaryColor: AppColors.primary,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.accent,
        surface: AppColors.surface,
        onPrimary: Colors.white,
      ),
      
      // Modern Text Theme (Fallbacks to default to prevent blocking startup)
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent, fontSize: 32),
        displayMedium: TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent, fontSize: 24),
        titleLarge: TextStyle(fontWeight: FontWeight.w700, color: AppColors.accent, fontSize: 20),
        bodyLarge: TextStyle(color: AppColors.accent, fontSize: 16),
        bodyMedium: TextStyle(color: AppColors.accent, fontSize: 14),
      ),
      
      // Premium App Bar
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.accent, size: 24),
      ),
      
      // High-end Button Styles
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 5,
          shadowColor: AppColors.primary.withOpacity(0.3),
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 30),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}

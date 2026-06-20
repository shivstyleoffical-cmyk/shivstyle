import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:convert';
import '../../../core/theme/app_colors.dart';
import '../../auth/screens/phone_auth_screen.dart';
import 'my_orders_screen.dart';
import 'shipping_addresses_screen.dart';
import 'notifications_screen.dart';
import 'privacy_security_screen.dart';
import 'help_center_screen.dart';
import 'refer_and_earn_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _userData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final dataString = prefs.getString('user_data');
    if (dataString != null) {
      if (mounted) {
        setState(() {
          _userData = jsonDecode(dataString);
          _isLoading = false;
        });
      }
    } else {
       if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _logout() async {
      final confirm = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
              backgroundColor: Colors.white,
              title: const Text("Logout", style: TextStyle(fontWeight: FontWeight.bold)),
              content: const Text("Are you sure you want to logout?"),
              actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx, false), 
                      child: const Text("Cancel", style: TextStyle(color: Colors.grey))
                  ),
                  TextButton(
                      onPressed: () => Navigator.pop(ctx, true), 
                      child: const Text("Logout", style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold))
                  ),
              ],
          )
      );

      if (confirm == true) {
          await FirebaseAuth.instance.signOut();
          final prefs = await SharedPreferences.getInstance();
          await prefs.clear();
          
          if (mounted) {
              Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
              );
          }
      }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator()) 
        : SingleChildScrollView(
            child: Column(
              children: [
                _buildHeader(),
                const SizedBox(height: 20),
                _buildStats(),
                const SizedBox(height: 30),
                _buildMenuSection(context),
                const SizedBox(height: 120), // Padding for bottom nav
              ],
            ),
        ),
    );
  }

  Widget _buildHeader() {
    final name = _userData?['name'] ?? 'Guest User';
    final email = _userData?['email'] ?? _userData?['phone'] ?? 'Guest';

    return Stack(
      children: [
        Container(
          height: 220,
          decoration: const BoxDecoration(
            color: Colors.black, // Changed to black as per design request in previous Context/Image
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(40),
              bottomRight: Radius.circular(40),
            ),
          ),
        ),
        Positioned(
          bottom: 20,
          left: 24,
          right: 24,
          child: Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)
                  ],
                ),
                child: const Icon(Icons.person_rounded, size: 50, color: AppColors.accent),
              ),
              const SizedBox(width: 20),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    email,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              InkWell(
                onTap: () async {
                    final result = await Navigator.push(
                        context, 
                        MaterialPageRoute(builder: (_) => EditProfileScreen(userData: _userData ?? {}))
                    );
                    if (result == true) {
                        _loadUserData();
                    }
                },
                child: _circularIcon(Icons.edit_rounded),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStats() {
    // Only showing coins if we have them, defaults hardcoded for demo where data missing
    final coins = _userData?['coins']?.toString() ?? '0';
    
    return FadeInUp(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5))
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _statItem('Orders', '12'),
            _verticalDivider(),
            _statItem('Wishlist', '24'),
            _verticalDivider(),
            _statItem('Coins', coins),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.accent)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
      ],
    );
  }

  Widget _verticalDivider() {
    return Container(height: 30, width: 1, color: Colors.grey[200]);
  }

  Widget _buildMenuSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          _menuItem(
            Icons.shopping_bag_outlined, 
            'My Orders', 
            'Track and manage your orders',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MyOrdersScreen())),
          ),
          _menuItem(
            Icons.location_on_outlined, 
            'Shipping Address', 
            'Manage your delivery addresses',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ShippingAddressesScreen())),
          ),
          _menuItem(
            Icons.notifications_none_rounded, 
            'Notifications', 
            'Order updates and offers',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          ),
          _menuItem(
            Icons.security_rounded, 
            'Privacy & Security', 
            'Change password, account data',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PrivacySecurityScreen())),
          ),
          _menuItem(
            Icons.headset_mic_outlined, 
            'Help Center', 
            'FAQs and customer support',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HelpCenterScreen())),
          ),
          _menuItem(
            Icons.card_giftcard_rounded, 
            'Refer & Earn', 
            'Invite friends and earn coins',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferAndEarnScreen())),
          ),
          const SizedBox(height: 20),
          _menuItem(
            Icons.logout_rounded, 
            'Logout', 
            'Sign out of your account', 
            color: Colors.redAccent,
            onTap: _logout,
          ),
        ],
      ),
    );
  }

  Widget _menuItem(IconData icon, String title, String subtitle, {Color? color, VoidCallback? onTap}) {
    return FadeInRight(
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2))
          ],
        ),
        child: ListTile(
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (color ?? AppColors.accent).withOpacity(0.05),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color ?? AppColors.accent, size: 22),
          ),
          title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: color ?? AppColors.accent)),
          subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
          trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey),
          onTap: onTap,
        ),
      ),
    );
  }

  Widget _circularIcon(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.white, size: 18),
    );
  }
}

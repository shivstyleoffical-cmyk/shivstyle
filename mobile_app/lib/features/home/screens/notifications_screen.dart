import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _orderUpdates = true;
  bool _promotions = true;
  bool _newArrivals = false;
  bool _priceDrops = true;
  bool _emailNotifications = false;
  bool _smsNotifications = true;
  bool _pushNotifications = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppColors.primary,
        title: const Text(
          'Notifications',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          FadeInDown(
            child: _buildSection(
              'Order Notifications',
              'Get updates about your orders',
              [
                _buildSwitchTile(
                  'Order Updates',
                  'Order confirmation, shipping, delivery updates',
                  _orderUpdates,
                  (value) => setState(() => _orderUpdates = value),
                  Icons.shopping_bag_outlined,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          FadeInDown(
            delay: const Duration(milliseconds: 100),
            child: _buildSection(
              'Notification Channels',
              'Choose how you want to receive notifications',
              [
                _buildSwitchTile(
                  'Push Notifications',
                  'Receive notifications on your device',
                  _pushNotifications,
                  (value) => setState(() => _pushNotifications = value),
                  Icons.notifications_active_outlined,
                ),
                _buildSwitchTile(
                  'Email Notifications',
                  'Receive updates via email',
                  _emailNotifications,
                  (value) => setState(() => _emailNotifications = value),
                  Icons.email_outlined,
                ),
                _buildSwitchTile(
                  'SMS Notifications',
                  'Receive important updates via SMS',
                  _smsNotifications,
                  (value) => setState(() => _smsNotifications = value),
                  Icons.sms_outlined,
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          
          FadeInUp(
            delay: const Duration(milliseconds: 300),
            child: SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Notification preferences saved'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  'Save Preferences',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, String subtitle, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: AppColors.accent,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          ...children,
        ],
      ),
    );
  }

  Widget _buildSwitchTile(
    String title,
    String subtitle,
    bool value,
    Function(bool) onChanged,
    IconData icon,
  ) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: AppColors.primary, size: 24),
      ),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
      ),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primary,
      ),
    );
  }
}

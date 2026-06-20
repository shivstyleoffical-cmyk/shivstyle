import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';

class PaymentMethodsScreen extends StatefulWidget {
  const PaymentMethodsScreen({super.key});

  @override
  State<PaymentMethodsScreen> createState() => _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends State<PaymentMethodsScreen> {
  final List<Map<String, dynamic>> _savedCards = [
    {
      'type': 'visa',
      'last4': '4242',
      'expiry': '12/25',
      'isDefault': true,
    },
    {
      'type': 'mastercard',
      'last4': '8888',
      'expiry': '06/26',
      'isDefault': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppColors.primary,
        title: const Text(
          'Payment Methods',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          FadeInDown(
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Text(
                'Saved Cards',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.accent,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          
          ...List.generate(_savedCards.length, (index) {
            return FadeInLeft(
              delay: Duration(milliseconds: index * 100),
              child: _buildCardItem(_savedCards[index], index),
            );
          }),
          
          const SizedBox(height: 16),
          
          FadeInUp(
            child: OutlinedButton.icon(
              onPressed: () {
                // TODO: Add new card
              },
              icon: const Icon(Icons.add_card_outlined),
              label: const Text('Add New Card'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary, width: 2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          
          const SizedBox(height: 32),
          
          FadeInDown(
            delay: const Duration(milliseconds: 200),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Text(
                'Other Payment Options',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.accent,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          
          FadeInRight(
            delay: const Duration(milliseconds: 300),
            child: _buildPaymentOption(
              'UPI',
              'Pay using any UPI app',
              Icons.qr_code_scanner,
              Colors.purple,
            ),
          ),
          const SizedBox(height: 12),
          
          FadeInRight(
            delay: const Duration(milliseconds: 350),
            child: _buildPaymentOption(
              'Net Banking',
              'Pay via your bank account',
              Icons.account_balance,
              Colors.blue,
            ),
          ),
          const SizedBox(height: 12),
          
          FadeInRight(
            delay: const Duration(milliseconds: 400),
            child: _buildPaymentOption(
              'Cash on Delivery',
              'Pay when you receive',
              Icons.money,
              Colors.green,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardItem(Map<String, dynamic> card, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            card['type'] == 'visa' ? Colors.blue : Colors.orange,
            (card['type'] == 'visa' ? Colors.blue : Colors.orange).withOpacity(0.7),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: (card['type'] == 'visa' ? Colors.blue : Colors.orange).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      card['type'].toString().toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                      ),
                    ),
                    if (card['isDefault'])
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'DEFAULT',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  '**** **** **** ${card['last4']}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'EXPIRES',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          card['expiry'],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          onPressed: () {
                            // TODO: Edit card
                          },
                          icon: const Icon(Icons.edit_outlined, color: Colors.white, size: 20),
                        ),
                        IconButton(
                          onPressed: () {
                            // TODO: Delete card
                          },
                          icon: const Icon(Icons.delete_outline, color: Colors.white, size: 20),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(String title, String subtitle, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(fontSize: 13, color: Colors.grey[600]),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      ),
    );
  }
}

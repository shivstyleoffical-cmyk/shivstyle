import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';

class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppColors.primary,
        title: const Text(
          'Help Center',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          FadeInDown(
            child: _buildContactCard(
              'Chat with Us',
              'Get instant help from our support team',
              Icons.chat_bubble_outline,
              Colors.blue,
              () {},
            ),
          ),
          const SizedBox(height: 12),
          
          FadeInDown(
            delay: const Duration(milliseconds: 100),
            child: _buildContactCard(
              'Call Us',
              '+91 1800-123-4567 (Toll Free)',
              Icons.phone_outlined,
              Colors.green,
              () {},
            ),
          ),
          const SizedBox(height: 12),
          
          FadeInDown(
            delay: const Duration(milliseconds: 200),
            child: _buildContactCard(
              'Email Us',
              'support@shiventerprise.com',
              Icons.email_outlined,
              Colors.orange,
              () {},
            ),
          ),
          const SizedBox(height: 24),
          
          FadeInLeft(
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Text(
                'Frequently Asked Questions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.accent,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          
          ..._buildFAQs(),
        ],
      ),
    );
  }

  Widget _buildContactCard(
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
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
        onTap: onTap,
      ),
    );
  }

  List<Widget> _buildFAQs() {
    final faqs = [
      {
        'question': 'How do I track my order?',
        'answer': 'Go to My Orders and click on any order to see detailed tracking information.',
      },
      {
        'question': 'What is your return policy?',
        'answer': 'We offer 7-day easy returns on most products. Items must be unused and in original packaging.',
      },
      {
        'question': 'How long does delivery take?',
        'answer': 'Standard delivery takes 3-5 business days. Express delivery is available in select cities.',
      },
      {
        'question': 'What payment methods do you accept?',
        'answer': 'We accept UPI, Net Banking, Credit/Debit Cards, and Cash on Delivery.',
      },
      {
        'question': 'How do I cancel my order?',
        'answer': 'You can cancel orders before they are shipped from the My Orders section.',
      },
    ];

    return List.generate(faqs.length, (index) {
      return FadeInRight(
        delay: Duration(milliseconds: 300 + (index * 50)),
        child: _buildFAQItem(
          faqs[index]['question']!,
          faqs[index]['answer']!,
        ),
      );
    });
  }

  Widget _buildFAQItem(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          childrenPadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          title: Text(
            question,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          children: [
            Text(
              answer,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey[700],
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

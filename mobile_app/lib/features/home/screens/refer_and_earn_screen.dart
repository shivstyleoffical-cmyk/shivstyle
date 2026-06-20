import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:animate_do/animate_do.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/widgets/app_button.dart';

class ReferAndEarnScreen extends StatefulWidget {
  const ReferAndEarnScreen({super.key});

  @override
  State<ReferAndEarnScreen> createState() => _ReferAndEarnScreenState();
}

class _ReferAndEarnScreenState extends State<ReferAndEarnScreen> {
  String _referralCode = "Loading...";
  int _coins = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('auth_token');

      if (token == null) {
          setState(() { _isLoading = false; _referralCode = "N/A"; });
          return;
      }

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}users/profile'),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = data['user'];
        
        await prefs.setString('user_data', jsonEncode(user)); // Update local storage

        setState(() {
          _referralCode = user['referral_code'] ?? "N/A";
          _coins = user['coins'] ?? 0;
          _isLoading = false;
        });
      } else {
         // Fallback to local
         _loadLocalData();
      }
    } catch (e) {
        _loadLocalData();
    }
  }

  Future<void> _loadLocalData() async {
      final prefs = await SharedPreferences.getInstance();
      final userDataString = prefs.getString('user_data');
      if (userDataString != null) {
        final userData = jsonDecode(userDataString);
        setState(() {
          _referralCode = userData['referral_code'] ?? "N/A";
          _coins = userData['coins'] ?? 0;
          _isLoading = false;
        });
      } else {
         setState(() => _isLoading = false);
      }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text("Refer & Earn"),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black87,
      ),
      body: _isLoading 
      ? const Center(child: CircularProgressIndicator()) 
      : SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            _buildHeader(),
            const SizedBox(height: 20),
            _buildReferralCard(),
            const SizedBox(height: 30),
            _buildSteps(),
            const SizedBox(height: 50),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(bottom: 40, top: 20, left: 24, right: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(50),
          bottomRight: Radius.circular(50),
        ),
        boxShadow: [
           BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 20, offset: const Offset(0, 10))
        ],
      ),
      child: Column(
        children: [
            FadeInDown(
                child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.05),
                        shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.card_giftcard_rounded, size: 64, color: AppColors.primary),
                ),
            ),
            const SizedBox(height: 24),
            FadeInDown(
                delay: const Duration(milliseconds: 200),
                child: const Text(
                  "Invite Friends & Earn",
                  style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.black, letterSpacing: -0.5),
                ),
            ),
            const SizedBox(height: 12),
            FadeInDown(
                delay: const Duration(milliseconds: 300),
                child: Text(
                  "Earn 10 coins for every friend who joins!",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 15, color: Colors.grey[600], height: 1.4),
                ),
            ),
             const SizedBox(height: 30),
            FadeInUp(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.black, // Elegant black for contrast
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                     BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                        const Icon(Icons.monetization_on_rounded, color: Color(0xFFFFD700), size: 24), // Gold coin icon
                        const SizedBox(width: 12),
                         Text(
                          "Balance: $_coins Coins",
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                    ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildReferralCard() {
    return FadeInUp(
      delay: const Duration(milliseconds: 400),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24),
        padding: const EdgeInsets.all(30),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: Colors.grey.withOpacity(0.1)),
          boxShadow: [
             BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10)),
          ],
        ),
        child: Column(
          children: [
            Text("YOUR REFERRAL CODE", style: TextStyle(fontSize: 12, color: Colors.grey[400], fontWeight: FontWeight.bold, letterSpacing: 1.5)),
            const SizedBox(height: 20),
            InkWell(
              onTap: () {
                Clipboard.setData(ClipboardData(text: _referralCode));
                 ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: const Text("Copied to clipboard!", style: TextStyle(color: Colors.white)),
                        behavior: SnackBarBehavior.floating,
                        backgroundColor: AppColors.accent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        margin: const EdgeInsets.all(20),
                    )
                 );
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 20),
                 decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.04), // Very subtle red background
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.primary.withOpacity(0.2), width: 1),
                  ),
                 child: Stack(
                     alignment: Alignment.center,
                     children: [
                        Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                            Text(
                                _referralCode,
                                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: 3.0, color: AppColors.primary),
                            ),
                            const SizedBox(width: 12),
                            const Icon(Icons.copy_rounded, color: AppColors.primary, size: 22),
                        ],
                        ),
                     ],
                 ),
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                    onPressed: () {
                        Clipboard.setData(ClipboardData(text: "Use my code $_referralCode to sign up on KalimGo and get 10 coins instantly! Download now."));
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Sharing content copied!")));
                    },
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text("Share Code", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSteps() {
      return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                  const Text("How it works", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.black)),
                  const SizedBox(height: 24),
                  _stepItem(1, "Invite Friends", "Share your unique code with friends."),
                  _stepItem(2, "They Sign Up", "Friends join using your code."),
                  _stepItem(3, "You Earn", "Both get 50 coins instantly!"),
              ],
          ),
      );
  }

  Widget _stepItem(int step, String title, String subtitle) {
      return FadeInRight(
          delay: Duration(milliseconds: 500 + step * 100),
          child: Container(
              margin: const EdgeInsets.only(bottom: 24),
              child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                      Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              shape: BoxShape.circle,
                          ),
                          child: Center(child: Text("$step", style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16))),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87)),
                                const SizedBox(height: 4),
                                Text(subtitle, style: TextStyle(fontSize: 13, color: Colors.grey[600], height: 1.4)),
                            ],
                        ),
                      ),
                  ],
              ),
          ),
      );
  }
}

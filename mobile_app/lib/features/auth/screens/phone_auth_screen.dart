import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';
import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/constants/assets.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/app_loading.dart';
import '../../home/screens/home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _referralController = TextEditingController();
  bool _showReferral = false;
  final TextEditingController _otpController = TextEditingController();
  bool _isOtpSent = false;
  String? _verificationId;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background Aesthetic elements
          Positioned(
            top: -100,
            right: -100,
            child: FadeInDown(
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.05),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: FadeInUp(
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.03),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
          SafeArea(
            child: _isLoading 
              ? const AppLoading() 
              : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 60),
                  FadeInDown(
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.06),
                              blurRadius: 25,
                              offset: const Offset(0, 12),
                            ),
                          ],
                        ),
                        child: Hero(
                          tag: 'logo',
                          child: Image.asset(
                            AppAssets.logo,
                            height: 100,
                            errorBuilder: (context, error, stackTrace) => const Icon(Icons.shopping_bag_rounded, size: 80, color: AppColors.primary),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 48),
                  
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 500),
                    child: Column(
                      key: ValueKey(_isOtpSent),
                      children: [
                        Text(
                          _isOtpSent ? "Verification" : "Welcome Back",
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 32, 
                            fontWeight: FontWeight.w900, 
                            color: AppColors.accent, 
                            letterSpacing: -1.2,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Text(
                            _isOtpSent 
                                ? "Enter the 6-digit code we sent to your phone number for secure access." 
                                : "Login or create an account with your phone number to start shopping.",
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 15, color: AppColors.textSecondary, height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 48),
                  
                  if (!_isOtpSent) ...[
                    FadeInUp(
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.02),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: AppTextField(
                          controller: _phoneController,
                          label: "Phone Number",
                          hint: "98765 43210",
                          prefixIcon: Icons.phone_iphone_rounded,
                          prefixText: "+91 ",
                          keyboardType: TextInputType.phone,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: () => setState(() => _showReferral = !_showReferral),
                      child: Text(
                        _showReferral ? "Hide Referral Code" : "Have a Referral Code?",
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (_showReferral)
                      FadeInUp(
                        child: Container(
                          margin: const EdgeInsets.only(top: 8),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.02),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: AppTextField(
                            controller: _referralController,
                            label: "Referral Code (Optional)",
                            hint: "Enter code here",
                            prefixIcon: Icons.card_giftcard,
                          ),
                        ),
                      ),
                    const SizedBox(height: 40),
                    FadeInUp(
                      delay: const Duration(milliseconds: 200),
                      child: AppButton(
                        text: "Login with OTP",
                        isLoading: _isLoading,
                        onPressed: _verifyPhone,
                      ),
                    ),
                  ] else ...[
                    FadeInUp(
                      child: Center(
                        child: Pinput(
                          length: 6,
                          controller: _otpController,
                          defaultPinTheme: PinTheme(
                            width: 52,
                            height: 64,
                            textStyle: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.accent),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.black.withOpacity(0.05)),
                            ),
                          ),
                          focusedPinTheme: PinTheme(
                            width: 56,
                            height: 68,
                            textStyle: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.primary, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.12),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                          ),
                          onCompleted: (pin) => _signInWithOTP(pin),
                        ),
                      ),
                    ),
                    const SizedBox(height: 48),
                    FadeInUp(
                      delay: const Duration(milliseconds: 200),
                      child: AppButton(
                        text: "Verify & Continue",
                        isLoading: _isLoading,
                        onPressed: () => _signInWithOTP(_otpController.text),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("Didn't receive code?", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        TextButton(
                          onPressed: _isLoading ? null : _verifyPhone,
                          child: const Text("RESEND", style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1)),
                        ),
                      ],
                    ),
                    Center(
                      child: TextButton(
                        onPressed: () => setState(() => _isOtpSent = false),
                        child: Text(
                          "Change Phone Number", 
                          style: TextStyle(
                            color: AppColors.textSecondary.withOpacity(0.7), 
                            fontSize: 12,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 60),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _verifyPhone() async {
    if (_phoneController.text.isEmpty) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter phone number')));
       return;
    }
    setState(() => _isLoading = true);
    try {
      String phoneNumber = _phoneController.text.trim();
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+91$phoneNumber';
      }
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await FirebaseAuth.instance.signInWithCredential(credential);
          if (mounted) _syncWithBackend();
        },
        verificationFailed: (FirebaseAuthException e) {
          if (mounted) {
            setState(() => _isLoading = false);
            _handleAuthError(e);
          }
        },
        codeSent: (String verificationId, int? resendToken) {
          if (mounted) {
            setState(() {
              _verificationId = verificationId;
              _isOtpSent = true;
              _isLoading = false;
            });
          }
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          if (mounted) _verificationId = verificationId;
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _handleAuthError(e);
      }
    }
  }

  Future<void> _signInWithOTP(String smsCode) async {
    setState(() => _isLoading = true);
    try {
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: smsCode,
      );
      await FirebaseAuth.instance.signInWithCredential(credential);
      await _syncWithBackend();
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _handleAuthError(e);
      }
    }
  }

  Future<void> _syncWithBackend() async {
    try {
       final user = FirebaseAuth.instance.currentUser;
       if (user == null) throw Exception("User not found after login");
       
       final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.loginPhone}');
       debugPrint('Syncing with backend: $url');
       debugPrint('Body: ${jsonEncode({'phone': user.phoneNumber, 'firebaseUid': user.uid})}');

       final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'phone': user.phoneNumber,
            'firebaseUid': user.uid,
            'referralCode': _referralController.text.isNotEmpty ? _referralController.text.trim() : null,
          }),
       );

       debugPrint('Response Code: ${response.statusCode}');
       debugPrint('Response Body: ${response.body}');

       if (response.statusCode == 200 || response.statusCode == 201) {
          final data = jsonDecode(response.body);
          final token = data['token'];
          final userData = data['user'];
          
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', token);
          if (userData != null) await prefs.setString('user_data', jsonEncode(userData));

          if (mounted) {
            setState(() => _isLoading = false);
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => HomeScreen(userName: userData['name'])),
            );
          }
       } else {
          final errorData = jsonDecode(response.body);
          throw Exception(errorData['message'] ?? "Backend returned ${response.statusCode}");
       }
    } catch (e) {
       if (mounted) {
         setState(() => _isLoading = false);
         _handleAuthError("Login Failed: ${e.toString().replaceAll('Exception:', '')}");
       }
    }

  }
  void _handleAuthError(dynamic e) {
    String message = "Something went wrong. Please try again.";
    
    if (e is FirebaseAuthException) {
      switch (e.code) {
        case 'invalid-phone-number':
          message = "The phone number you entered is not valid.";
          break;
        case 'too-many-requests':
          message = "Too many attempts. Please try again later.";
          break;
        case 'invalid-verification-code':
          message = "The OTP you entered is incorrect.";
          break;
        case 'session-expired':
          message = "The verification session has expired. Please request a new OTP.";
          break;
        default:
          message = e.message ?? message;
      }
    } else if (e is String) {
      message = e;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.black87,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(20),
        duration: const Duration(seconds: 3),
      ),
    );
  }
}

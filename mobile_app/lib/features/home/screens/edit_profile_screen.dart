import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:pinput/pinput.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> userData;

  const EditProfileScreen({super.key, required this.userData});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  bool _isLoading = false;
  String? _verificationId;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.userData['name'] ?? '');
    _phoneController = TextEditingController(text: widget.userData['phone'] ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    final originalPhone = widget.userData['phone'] ?? '';
    final newPhone = _phoneController.text.trim();
    
    if (newPhone.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Phone number cannot be empty")));
        return;
    }

    // Process Name Update directly if Phone hasn't changed
    if (originalPhone == newPhone) {
        await _updateProfile();
    } else {
        // Phone Changed - Needs Verification
        await _startPhoneVerification(newPhone);
    }
  }

  Future<void> _startPhoneVerification(String phoneNumber) async {
      setState(() => _isLoading = true);
      String formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : '+91$phoneNumber'; // Defaulting to +91 locally if missing

      try {
           await FirebaseAuth.instance.verifyPhoneNumber(
              phoneNumber: formattedPhone,
              verificationCompleted: (PhoneAuthCredential credential) async {
                  // Auto-resolution (rare on some devices, but good to handle)
                  await _finalizePhoneUpdate(credential);
              },
              verificationFailed: (FirebaseAuthException e) {
                  setState(() => _isLoading = false);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Verification Failed: ${e.message}")));
              },
              codeSent: (String verificationId, int? resendToken) {
                  setState(() {
                      _isLoading = false;
                      _verificationId = verificationId;
                  });
                  _showOtpDialog(formattedPhone);
              },
              codeAutoRetrievalTimeout: (String verificationId) {
                  _verificationId = verificationId;
              },
          );
      } catch (e) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
      }
  }

  void _showOtpDialog(String phoneNumber) {
      showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) {
              final otpController = TextEditingController();
              return AlertDialog(
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  title: const Text("Verify Phone Number", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                          Text("Enter the OTP sent to $phoneNumber", style: const TextStyle(color: Colors.grey, fontSize: 14)),
                          const SizedBox(height: 20),
                          Pinput(
                              controller: otpController,
                              length: 6,
                              defaultPinTheme: PinTheme(
                                  width: 45,
                                  height: 50,
                                  decoration: BoxDecoration(
                                      color: Colors.grey[100],
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: Colors.grey[300]!)
                                  ),
                                  textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)
                              ),
                              focusedPinTheme: PinTheme(
                                  width: 45,
                                  height: 50,
                                  decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: Colors.black, width: 2)
                                  ),
                              ),
                          ),
                      ],
                  ),
                  actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
                      ),
                      TextButton(
                          onPressed: () async {
                              final smsCode = otpController.text.trim();
                              if (smsCode.length == 6 && _verificationId != null) {
                                  Navigator.pop(context); // Close dialog
                                  setState(() => _isLoading = true);
                                  
                                  final credential = PhoneAuthProvider.credential(
                                      verificationId: _verificationId!,
                                      smsCode: smsCode
                                  );
                                  
                                  await _finalizePhoneUpdate(credential);
                              }
                          },
                          child: const Text("Verify", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                      ),
                  ],
              );
          }
      );
  }

  Future<void> _finalizePhoneUpdate(PhoneAuthCredential credential) async {
       try {
           final user = FirebaseAuth.instance.currentUser;
           if (user != null) {
               await user.updatePhoneNumber(credential);
               // If Firebase update successful, update Backend
               await _updateProfile(); 
           }
       } on FirebaseAuthException catch (e) {
            setState(() => _isLoading = false);
            String msg = "Verification Failed";
            if (e.code == 'credential-already-in-use') msg = "This phone number is already linked to another account.";
            else if (e.code == 'invalid-verification-code') msg = "Invalid OTP";
            
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
       } catch (e) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
       }
  }

  Future<void> _updateProfile() async {
    // Logic handles both explicit call or call after OTP
    // If we are here, Phone is already verified on Firebase side if it was changed
    
    // Safety check if not loading
    if (!_isLoading) setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');

      if (token == null) throw Exception("Not logged in");

      final response = await http.put(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.userProfile}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'name': _nameController.text.trim(),
          'phone': _phoneController.text.trim(),
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          await prefs.setString('user_data', jsonEncode(data['user']));
          
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Profile updated successfully!')),
            );
            Navigator.pop(context, true); 
          }
        } else {
             throw Exception(data['message'] ?? 'Update failed');
        }
      } else {
        throw Exception('Failed to update profile: ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Edit Profile", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          children: [
            Stack(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.black, // Black theme
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 5))
                    ]
                  ),
                  child: const Icon(Icons.person, size: 50, color: Colors.white),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.black, width: 2),
                    ),
                    child: const Icon(Icons.camera_alt, size: 16, color: Colors.black),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
            
            // Name Field
            _buildBlackWhiteField(
                controller: _nameController, 
                label: "Full Name", 
                icon: Icons.person_outline_rounded
            ),
            
            const SizedBox(height: 24),
            
            // Phone Field
            _buildBlackWhiteField(
                controller: _phoneController, 
                label: "Phone Number", 
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone
            ),
             const SizedBox(height: 8),
             Align(
                 alignment: Alignment.centerLeft,
                 child: Text(
                     "Note: Updating phone number requires Verification.",
                     style: TextStyle(fontSize: 12, color: Colors.grey[500], fontStyle: FontStyle.italic),
                 ),
             ),

            const SizedBox(height: 50),
            
            SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleSave,
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        disabledBackgroundColor: Colors.grey[300]
                    ),
                    child: _isLoading 
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text("Save Changes", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBlackWhiteField({
    required TextEditingController controller, 
    required String label, 
    required IconData icon,
    TextInputType keyboardType = TextInputType.text
  }) {
      return Container(
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 4))
              ]
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            cursorColor: Colors.black,
            style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black),
            decoration: InputDecoration(
                labelText: label,
                labelStyle: const TextStyle(color: Colors.grey),
                floatingLabelStyle: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                prefixIcon: Icon(icon, color: Colors.black),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none, // Clean look
                ),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Colors.black, width: 1.5),
                ),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18)
            ),
          ),
      );
  }
}

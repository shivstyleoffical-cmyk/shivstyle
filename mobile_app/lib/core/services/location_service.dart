import 'package:geolocator/geolocator.dart';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class LocationModel {
  final String id;
  final String cityName;
  final String state;
  final bool isActive;
  final double deliveryCharge;
  final double minOrderAmount;

  LocationModel({
    required this.id,
    required this.cityName,
    required this.state,
    required this.isActive,
    required this.deliveryCharge,
    required this.minOrderAmount,
  });

  factory LocationModel.fromJson(Map<String, dynamic> json) {
    return LocationModel(
      id: json['id'] ?? '',
      cityName: json['city_name'] ?? '',
      state: json['state'] ?? 'West Bengal',
      isActive: json['is_active'] ?? true,
      deliveryCharge: double.tryParse(json['delivery_charge']?.toString() ?? '') ?? 50.0,
      minOrderAmount: double.tryParse(json['min_order_amount']?.toString() ?? '') ?? 0.0,
    );
  }
}

class LocationService {
  final ApiService _apiService;

  LocationService() : _apiService = ApiService(baseUrl: ApiConstants.baseUrl);

  /// Fetch all active locations from backend
  Future<List<LocationModel>> getActiveLocations() async {
    final response = await _apiService.get(ApiConstants.activeLocations);
    if (response['success'] == true) {
      return (response['locations'] as List)
          .map((item) => LocationModel.fromJson(item))
          .toList();
    }
    return [];
  }

  static Future<bool> hasPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    return permission == LocationPermission.always || permission == LocationPermission.whileInUse;
  }

  static Future<void> forceRequestPermission(BuildContext context) async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check if services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (context.mounted) {
        await _showPermissionDialog(
          context, 
          "Location Services Disabled", 
          "Please enable location services to continue using the app.",
          () => Geolocator.openLocationSettings(),
        );
      }
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.deniedForever) {
      if (context.mounted) {
        await _showPermissionDialog(
          context, 
          "Permission Required", 
          "You have permanently denied location permissions. Please enable them in settings to place orders.",
          () => Geolocator.openAppSettings(),
        );
      }
    }
  }

  static Future<void> _showPermissionDialog(
    BuildContext context, 
    String title, 
    String body, 
    VoidCallback onOpenSettings
  ) async {
    return showDialog(
      context: context,
      barrierDismissible: false, // Force them to interact
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        content: Text(body),
        actions: [
          TextButton(
            onPressed: () {
              onOpenSettings();
              Navigator.pop(context);
            },
            child: const Text("OPEN SETTINGS", style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

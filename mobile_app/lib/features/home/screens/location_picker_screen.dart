import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:provider/provider.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/top_toast.dart';
import '../../../core/providers/address_provider.dart';
import '../../../core/services/location_service.dart';
import '../models/address_model.dart';

class MapLocationPicker extends StatefulWidget {
  const MapLocationPicker({super.key});

  @override
  State<MapLocationPicker> createState() => _MapLocationPickerState();
}

class _MapLocationPickerState extends State<MapLocationPicker> {
  static const LatLng _kalimpongCenter = LatLng(27.0594, 88.4731);
  LatLng _lastSelectedPos = _kalimpongCenter;
  String _addressLine = "Locating your address...";
  bool _isLoading = false;
  GoogleMapController? _mapController;
  
  final _searchController = TextEditingController();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _houseController = TextEditingController();
  final _areaController = TextEditingController();
  
  String? _primaryPhone;
  List<LocationModel> _serviceableLocations = [];
  final LocationService _locationService = LocationService();

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _fetchServiceableLocations();
    _getCurrentLocation();
  }

  Future<void> _fetchServiceableLocations() async {
    try {
      final locs = await _locationService.getActiveLocations();
      debugPrint("Fetched ${locs.length} serviceable locations from backend");
      
      setState(() {
        if (locs.isNotEmpty) {
          _serviceableLocations = locs;
        } else {
          // Fallback if backend is empty (development safety)
          debugPrint("Backend locations empty, using default fallbacks");
          _serviceableLocations = [
            LocationModel(id: 'default-1', cityName: 'Kalimpong', state: 'West Bengal', isActive: true, deliveryCharge: 50, minOrderAmount: 0),
            LocationModel(id: 'default-2', cityName: 'Siliguri', state: 'West Bengal', isActive: true, deliveryCharge: 50, minOrderAmount: 0),
          ];
        }
      });
    } catch (e) {
      debugPrint("Error fetching locations: $e");
      setState(() {
         // Error fallback
        _serviceableLocations = [
          LocationModel(id: 'err-1', cityName: 'Kalimpong', state: 'West Bengal', isActive: true, deliveryCharge: 50, minOrderAmount: 0),
          LocationModel(id: 'err-2', cityName: 'Siliguri', state: 'West Bengal', isActive: true, deliveryCharge: 50, minOrderAmount: 0),
        ];
      });
    }
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataStr = prefs.getString('user_data');
    if (userDataStr != null) {
      final userData = jsonDecode(userDataStr);
      setState(() {
        _nameController.text = userData['name'] ?? '';
        _primaryPhone = userData['phone'];
        _mobileController.text = _primaryPhone ?? '';
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _nameController.dispose();
    _mobileController.dispose();
    _houseController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      TopToast.show(context, "Location services are disabled", isError: true);
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    try {
      Position position = await Geolocator.getCurrentPosition();
      LatLng currentPos = LatLng(position.latitude, position.longitude);
      _mapController?.animateCamera(CameraUpdate.newLatLngZoom(currentPos, 16));
      _onCameraIdle(currentPos);
    } catch (e) {
      debugPrint("Error getting location: $e");
    }
  }

  Future<void> _searchAddress(String query) async {
    if (query.isEmpty) return;
    
    setState(() => _isLoading = true);
    try {
      List<Location> locations = await locationFromAddress(query);
      if (locations.isNotEmpty) {
        final loc = locations.first;
        final target = LatLng(loc.latitude, loc.longitude);
        _mapController?.animateCamera(CameraUpdate.newLatLngZoom(target, 16));
        _onCameraIdle(target);
      }
    } catch (e) {
      TopToast.show(context, "Place not found", isError: true);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _onCameraIdle(LatLng position) async {
    setState(() {
      _isLoading = true;
      _lastSelectedPos = position;
    });

    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        setState(() {
          _addressLine = "${p.name ?? ''}, ${p.subLocality ?? ''}, ${p.locality ?? ''}, ${p.postalCode ?? ''}";
          _houseController.text = p.name ?? '';
          _areaController.text = "${p.subLocality ?? ''}, ${p.thoroughfare ?? ''}".trim();
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _addressLine = "Address not found";
        _isLoading = false;
      });
    }
  }

  void _showOutOfServiceModal() {
    showDialog(
      context: context,
      builder: (context) => FadeInUp(
        duration: const Duration(milliseconds: 300),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 10),
              Icon(Icons.sentiment_dissatisfied_rounded, size: 80, color: Colors.grey[400]),
              const SizedBox(height: 20),
              const Text(
                'Out of Service Area',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.accent),
              ),
              const SizedBox(height: 12),
              Text(
                _serviceableLocations.isEmpty 
                  ? 'Currently, we are not delivering to this area. Hang tight, we will be in your place soon!'
                  : 'Currently, we are delivering only in ${_serviceableLocations.map((e) => e.cityName).join(" & ")}. Hang tight, we will be in your place soon!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.5),
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('GOT IT', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDetailsSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 30,
          top: 30,
          left: 24,
          right: 24,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Exact Address Details',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.accent),
              ),
              const SizedBox(height: 8),
              Text(
                "Refine your location to help our delivery partner find you easily.",
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 24),
              _buildRefineField(_houseController, 'House No. / Building / Floor', Icons.business_outlined),
              const SizedBox(height: 16),
              _buildRefineField(_areaController, 'Area / Locality / Landmark', Icons.location_on_outlined),
              const SizedBox(height: 16),
              _buildRefineField(_nameController, 'Receiver Name', Icons.person_outline),
              const SizedBox(height: 16),
              _buildRefineField(
                _mobileController, 
                'Contact Number (Registered)', 
                Icons.lock_outline, 
                keyboardType: TextInputType.phone,
                readOnly: true,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: _saveAndExit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: const Text('SAVE ADDRESS', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRefineField(TextEditingController controller, String label, IconData icon, {TextInputType? keyboardType, bool readOnly = false}) {
    return TextField(
      controller: controller,
      readOnly: readOnly,
      keyboardType: keyboardType,
      style: TextStyle(
        fontSize: 14, 
        fontWeight: FontWeight.bold,
        color: readOnly ? Colors.grey[600] : Colors.black,
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.grey[500], fontSize: 13, fontWeight: FontWeight.normal),
        prefixIcon: Icon(icon, size: 20, color: readOnly ? Colors.grey : Colors.black),
        filled: readOnly,
        fillColor: readOnly ? Colors.grey[100] : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: Colors.grey[200]!)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: Colors.grey[200]!)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: const BorderSide(color: Colors.black, width: 2)),
      ),
    );
  }

  Future<void> _saveAndExit() async {
    if (_nameController.text.isEmpty || _houseController.text.isEmpty) {
      TopToast.show(context, "Please fill all required details", isError: true);
      return;
    }

    String finalPhone = _mobileController.text.isEmpty ? (_primaryPhone ?? '') : _mobileController.text;
    if (finalPhone.isEmpty) {
      TopToast.show(context, "Please provide a contact number", isError: true);
      return;
    }

    try {
      // One last try to fetch if list is empty
      if (_serviceableLocations.isEmpty) {
        await _fetchServiceableLocations();
      }

      List<Placemark> p = await placemarkFromCoordinates(_lastSelectedPos.latitude, _lastSelectedPos.longitude);
      final placemark = p.first;
      
      // Greediest matching: Combine every possible field to find a city name
      final String fullAddress = [
        placemark.name,
        placemark.subLocality,
        placemark.locality,
        placemark.subAdministrativeArea,
        placemark.administrativeArea,
        placemark.thoroughfare,
        placemark.street,
        placemark.postalCode,
      ].map((e) => (e ?? '').trim().toLowerCase()).join(' ');
      
      debugPrint("Validating address area: $fullAddress");
      
      bool isServiceable = _serviceableLocations.any((loc) {
        final cityName = loc.cityName.trim().toLowerCase();
        return fullAddress.contains(cityName) || cityName.contains(fullAddress) && fullAddress.length > 5;
      });

      // Special check for Kalimpong/Siliguri regions if not explicitly in string
      if (!isServiceable) {
        final String regionalCheck = "${placemark.locality} ${placemark.subAdministrativeArea} ${placemark.administrativeArea}".toLowerCase();
        if (regionalCheck.contains('darjeeling') || regionalCheck.contains('kalimpong') || placemark.postalCode?.startsWith('734') == true) {
           isServiceable = _serviceableLocations.any((loc) {
             final c = loc.cityName.toLowerCase();
             return c.contains('siliguri') || c.contains('kalimpong');
           });
           debugPrint("Regional fallback check: $isServiceable");
        }
      }

      if (!isServiceable) {
        Navigator.pop(context); // Close sheet
        _showOutOfServiceModal();
        return;
      }
      
      final address = AddressModel(
        name: _nameController.text,
        mobile: finalPhone,
        flatHouse: _houseController.text,
        areaLocality: _areaController.text,
        city: placemark.locality ?? '',
        state: placemark.administrativeArea ?? '',
        pincode: placemark.postalCode ?? '',
        country: placemark.country ?? 'India',
        isDefault: true,
      );

      if (!mounted) return;
      
      // We must await this to ensure the address is saved on the BE before we pop 
      // and refresh the previous screen's UI
      await Provider.of<AddressProvider>(context, listen: false).addAddress(address);
      
      if (mounted) {
        Navigator.pop(context); // Close sheet
        Navigator.pop(context); // Exit map
        TopToast.show(context, "Address saved successfully!");
      }
    } catch (e) {
      if (mounted) {
        TopToast.show(context, "Error saving location: ${e.toString()}", isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: const CameraPosition(target: _kalimpongCenter, zoom: 15),
            onMapCreated: (controller) => _mapController = controller,
            onCameraMove: (position) => _lastSelectedPos = position.target,
            onCameraIdle: () => _onCameraIdle(_lastSelectedPos),
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          ),
          
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 15,
            right: 15,
            child: Container(
              height: 55,
              padding: const EdgeInsets.symmetric(horizontal: 5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.black),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: const InputDecoration(
                        hintText: 'Search for a new area, locality...',
                        hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 10),
                      ),
                      style: const TextStyle(fontSize: 14),
                      onSubmitted: (val) => _searchAddress(val),
                      onChanged: (val) {
                        EasyDebounce.debounce(
                          'map-search', 
                          const Duration(milliseconds: 1000), 
                          () => _searchAddress(val)
                        );
                      },
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(right: 10),
                    child: Icon(Icons.search, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),

          Center(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 40),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: Colors.black, shape: BoxShape.circle),
                    child: const Icon(Icons.location_on, color: Colors.white, size: 30),
                  ),
                  Container(height: 20, width: 2, color: Colors.black),
                ],
              ),
            ),
          ),

          Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 20)],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Delivering your order to',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      TextButton(
                        onPressed: _getCurrentLocation,
                        style: TextButton.styleFrom(backgroundColor: Colors.black, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4)),
                        child: const Text('Allow Location', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.black, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _addressLine,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, height: 1.2),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            _searchController.clear();
                            FocusScope.of(context).unfocus();
                          },
                          child: const Text('Change', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _showDetailsSheet,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Text('Add Exact Address Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 0.5)),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward_ios, size: 14),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          Positioned(
            right: 20,
            bottom: 230,
            child: FloatingActionButton(
              onPressed: _getCurrentLocation,
              backgroundColor: Colors.white,
              mini: true,
              child: const Icon(Icons.my_location, color: Colors.black),
            ),
          ),
        ],
      ),
    );
  }
}

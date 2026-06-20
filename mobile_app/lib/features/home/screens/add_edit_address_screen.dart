import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/services/address_service.dart';
import '../../../core/theme/app_colors.dart';
import '../models/address_model.dart';
import 'location_picker_screen.dart';
import 'package:geocoding/geocoding.dart';

class AddEditAddressScreen extends StatefulWidget {
  final AddressModel? address;

  const AddEditAddressScreen({super.key, this.address});

  @override
  State<AddEditAddressScreen> createState() => _AddEditAddressScreenState();
}

class _AddEditAddressScreenState extends State<AddEditAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  final AddressService _addressService = AddressService();
  
  late TextEditingController _nameController;
  late TextEditingController _mobileController;
  late TextEditingController _flatHouseController;
  late TextEditingController _areaLocalityController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _pincodeController;
  late TextEditingController _countryController;
  
  bool _isDefault = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.address?.name ?? '');
    _mobileController = TextEditingController(text: widget.address?.mobile ?? '');
    _flatHouseController = TextEditingController(text: widget.address?.flatHouse ?? '');
    _areaLocalityController = TextEditingController(text: widget.address?.areaLocality ?? '');
    _cityController = TextEditingController(text: widget.address?.city ?? '');
    _stateController = TextEditingController(text: widget.address?.state ?? '');
    _pincodeController = TextEditingController(text: widget.address?.pincode ?? '');
    _countryController = TextEditingController(text: widget.address?.country ?? 'India');
    _isDefault = widget.address?.isDefault ?? false;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _flatHouseController.dispose();
    _areaLocalityController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final address = AddressModel(
        id: widget.address?.id,
        name: _nameController.text.trim(),
        mobile: _mobileController.text.trim(),
        flatHouse: _flatHouseController.text.trim(),
        areaLocality: _areaLocalityController.text.trim(),
        city: _cityController.text.trim(),
        state: _stateController.text.trim(),
        pincode: _pincodeController.text.trim(),
        country: _countryController.text.trim(),
        isDefault: _isDefault,
      );

      if (widget.address == null) {
        await _addressService.addAddress(address);
      } else {
        await _addressService.updateAddress(widget.address!.id!, address);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.address == null
                ? 'Address added successfully'
                : 'Address updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save address: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0.5,
        backgroundColor: Colors.white,
        centerTitle: true,
        title: Text(
          widget.address == null ? 'Add Address' : 'Edit Address',
          style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.accent, fontSize: 16, letterSpacing: 1),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.accent, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            if (widget.address == null)
              FadeInDown(
                child: GestureDetector(
                  onTap: () async {
                    // Navigate to map picker
                    await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const MapLocationPicker()),
                    );
                    // Since MapLocationPicker saves directly, we just pop back here 
                    // and let the parent list refresh
                    if (mounted) Navigator.pop(context, true);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.black.withOpacity(0.1)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: const BoxDecoration(color: Colors.black, shape: BoxShape.circle),
                          child: const Icon(Icons.map_rounded, color: Colors.white, size: 20),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('Locate on Map', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                              Text('Use Google Maps for better accuracy', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.black26),
                      ],
                    ),
                  ),
                ),
              ),
            
            const SizedBox(height: 32),
            const Text('PRIMARY DETAILS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1)),
            const SizedBox(height: 16),
            _buildRefineField(_nameController, 'Receiver Full Name', Icons.person_outline),
            const SizedBox(height: 16),
            _buildRefineField(_mobileController, 'Contact Number', Icons.phone_android_outlined, keyboardType: TextInputType.phone),
            
            const SizedBox(height: 32),
            const Text('ADDRESS INFO', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1)),
            const SizedBox(height: 16),
            _buildRefineField(_flatHouseController, 'House No. / Building / Floor', Icons.business_outlined),
            const SizedBox(height: 16),
            _buildRefineField(_areaLocalityController, 'Area / Locality / Landmark', Icons.location_on_outlined),
            
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildRefineField(_cityController, 'City', Icons.map_outlined)),
                const SizedBox(width: 16),
                Expanded(child: _buildRefineField(_pincodeController, 'Pincode', Icons.pin_drop_outlined, keyboardType: TextInputType.number)),
              ],
            ),
            const SizedBox(height: 16),
            _buildRefineField(_stateController, 'State', Icons.explore_outlined),
            
            const SizedBox(height: 32),
            FadeInUp(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: CheckboxListTile(
                  value: _isDefault,
                  onChanged: (value) => setState(() => _isDefault = value ?? false),
                  title: const Text('Set as default address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  activeColor: Colors.black,
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                ),
              ),
            ),
            
            const SizedBox(height: 40),
            FadeInUp(
              child: SizedBox(
                height: 55,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveAddress,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                    elevation: 0,
                  ),
                  child: _isLoading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(
                        widget.address == null ? 'SAVE ADDRESS' : 'UPDATE ADDRESS',
                        style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildRefineField(TextEditingController controller, String label, IconData icon, {TextInputType? keyboardType}) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.grey[500], fontSize: 13, fontWeight: FontWeight.normal),
        prefixIcon: Icon(icon, size: 20, color: Colors.black),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: Colors.grey[200]!)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: Colors.grey[200]!)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: const BorderSide(color: Colors.black, width: 2)),
        filled: true,
        fillColor: Colors.grey[50],
      ),
    );
  }
}

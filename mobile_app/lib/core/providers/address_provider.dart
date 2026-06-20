import 'package:flutter/material.dart';
import '../../features/home/models/address_model.dart';
import '../services/address_service.dart';

class AddressProvider extends ChangeNotifier {
  List<AddressModel> _addresses = [];
  AddressModel? _selectedAddress;
  bool _isLoading = false;
  final AddressService _addressService = AddressService();

  List<AddressModel> get addresses => _addresses;
  AddressModel? get selectedAddress => _selectedAddress;
  bool get isLoading => _isLoading;

  AddressProvider() {
    // We don't fetch automatically on init here because we need user token
    // It should be fetched when dashboard or checkout loads
  }

  Future<void> fetchAddresses() async {
    _isLoading = true;
    notifyListeners();
    try {
      _addresses = await _addressService.getAddresses();
      if (_addresses.isNotEmpty) {
        _selectedAddress = _addresses.firstWhere(
          (a) => a.isDefault, 
          orElse: () => _addresses.first,
        );
      } else {
        _selectedAddress = null;
      }
    } catch (e) {
      debugPrint('Error fetching addresses: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectAddress(AddressModel address) {
    _selectedAddress = address;
    notifyListeners();
  }

  Future<void> addAddress(AddressModel address) async {
    _isLoading = true;
    notifyListeners();
    try {
      final newAddress = await _addressService.addAddress(address);
      await fetchAddresses(); // Refresh list to get proper defaults and sorting
    } catch (e) {
      debugPrint('Error adding address: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateAddress(String id, AddressModel address) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _addressService.updateAddress(id, address);
      await fetchAddresses();
    } catch (e) {
      debugPrint('Error updating address: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> removeAddress(String id) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _addressService.deleteAddress(id);
      await fetchAddresses();
    } catch (e) {
      debugPrint('Error removing address: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> setDefaultAddress(String id) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _addressService.setDefaultAddress(id);
      await fetchAddresses();
    } catch (e) {
      debugPrint('Error setting default address: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

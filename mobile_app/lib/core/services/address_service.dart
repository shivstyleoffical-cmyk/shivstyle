import '../services/api_service.dart';
import '../constants/api_constants.dart';
import '../../features/home/models/address_model.dart';

class AddressService {
  final ApiService _apiService;

  AddressService() : _apiService = ApiService(baseUrl: ApiConstants.baseUrl);

  Future<List<AddressModel>> getAddresses() async {
    final response = await _apiService.get(ApiConstants.userAddresses, requiresAuth: true);
    if (response['success'] == true) {
      final List list = response['addresses'] ?? [];
      return list.map((item) => _mapBackendToFrontend(item)).toList();
    }
    throw ApiException(response['message'] ?? 'Failed to fetch addresses');
  }

  Future<AddressModel> addAddress(AddressModel address) async {
    final response = await _apiService.post(
      ApiConstants.userAddresses,
      body: _mapFrontendToBackend(address),
      requiresAuth: true,
    );
    if (response['success'] == true) {
      return _mapBackendToFrontend(response['address']);
    }
    throw ApiException(response['message'] ?? 'Failed to add address');
  }

  Future<AddressModel> updateAddress(String id, AddressModel address) async {
    final response = await _apiService.put(
      '${ApiConstants.userAddresses}/$id',
      body: _mapFrontendToBackend(address),
      requiresAuth: true,
    );
    if (response['success'] == true) {
      return _mapBackendToFrontend(response['address']);
    }
    throw ApiException(response['message'] ?? 'Failed to update address');
  }

  Future<void> deleteAddress(String id) async {
    final response = await _apiService.delete('${ApiConstants.userAddresses}/$id', requiresAuth: true);
    if (response['success'] != true) {
      throw ApiException(response['message'] ?? 'Failed to delete address');
    }
  }

  Future<void> setDefaultAddress(String id) async {
    final response = await _apiService.put('${ApiConstants.userAddresses}/$id/set-default', requiresAuth: true);
    if (response['success'] != true) {
      throw ApiException(response['message'] ?? 'Failed to set default address');
    }
  }

  // Mappers
  AddressModel _mapBackendToFrontend(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'],
      name: json['full_name'] ?? '',
      mobile: json['phone'] ?? '',
      flatHouse: json['address_line1'] ?? '',
      areaLocality: json['address_line2'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['postal_code'] ?? '',
      country: json['country'] ?? 'India',
      isDefault: json['is_default'] ?? false,
    );
  }

  Map<String, dynamic> _mapFrontendToBackend(AddressModel address) {
    return {
      'full_name': address.name,
      'phone': address.mobile,
      'address_line1': address.flatHouse,
      'address_line2': address.areaLocality,
      'city': address.city,
      'state': address.state,
      'postal_code': address.pincode,
      'country': address.country,
      'is_default': address.isDefault,
    };
  }
}

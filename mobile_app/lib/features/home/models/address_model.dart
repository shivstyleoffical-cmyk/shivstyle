class AddressModel {
  final String? id;
  final String name;
  final String mobile;
  final String flatHouse;
  final String areaLocality;
  final String city;
  final String state;
  final String pincode;
  final String country;
  final bool isDefault;

  AddressModel({
    this.id,
    required this.name,
    required this.mobile,
    required this.flatHouse,
    required this.areaLocality,
    required this.city,
    required this.state,
    required this.pincode,
    this.country = 'India',
    this.isDefault = false,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'],
      name: json['full_name'] ?? json['name'] ?? '',
      mobile: json['phone'] ?? json['mobile'] ?? '',
      flatHouse: json['address_line1'] ?? json['flatHouse'] ?? '',
      areaLocality: json['address_line2'] ?? json['areaLocality'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['postal_code'] ?? json['pincode'] ?? '',
      country: json['country'] ?? 'India',
      isDefault: json['is_default'] ?? json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'mobile': mobile,
      'flatHouse': flatHouse,
      'areaLocality': areaLocality,
      'city': city,
      'state': state,
      'pincode': pincode,
      'country': country,
      'isDefault': isDefault,
    };
  }

  String get fullAddress => "$flatHouse, $areaLocality, $city, $state - $pincode, $country";
}

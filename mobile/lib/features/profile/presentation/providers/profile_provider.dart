import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProfileState {

  ProfileState({this.name, this.email, this.phone, this.avatar, this.city});
  final String? name;
  final String? email;
  final String? phone;
  final String? avatar;
  final String? city;

  ProfileState copyWith({
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? city,
  }) {
    return ProfileState(
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      city: city ?? this.city,
    );
  }
}

class ProfileNotifier extends StateNotifier<ProfileState> {
  ProfileNotifier() : super(ProfileState());

  void updateProfile({String? name, String? email, String? phone, String? city}) {
    state = state.copyWith(
      name: name,
      email: email,
      phone: phone,
      city: city,
    );
  }

  void loadProfile({required String name, required String email, String? phone, String? avatar, String? city}) {
    state = ProfileState(
      name: name,
      email: email,
      phone: phone,
      avatar: avatar,
      city: city,
    );
  }
}

final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier();
});

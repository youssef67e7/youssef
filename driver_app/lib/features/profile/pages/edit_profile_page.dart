import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_driver/core/localization/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/core/utils/validators.dart';
import 'package:pharmaworld_driver/core/utils/snackbar_helper.dart';
import 'package:pharmaworld_driver/features/profile/provider/profile_provider.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _vehicleTypeController = TextEditingController();
  final _licensePlateController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _vehicleTypeController.dispose();
    _licensePlateController.dispose();
    super.dispose();
  }

  void _loadProfile() {
    final profile = ref.read(profileProvider).valueOrNull;
    if (profile != null) {
      _nameController.text = profile.name;
      _emailController.text = profile.email ?? '';
      _phoneController.text = profile.phone;
      _vehicleTypeController.text = profile.vehicleType ?? '';
      _licensePlateController.text = profile.licensePlate ?? '';
    }
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await ref.read(updateProfileProvider.notifier).updateProfile({
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'vehicleType': _vehicleTypeController.text.trim(),
        'licensePlate': _licensePlateController.text.trim(),
      });
      if (mounted) {
        SnackbarHelper.showSuccess(context, 'Profile updated successfully');
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        SnackbarHelper.showError(context, e.toString());
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n?.editProfile ?? 'Edit Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 60,
                      backgroundColor: AppColors.primaryLight.withOpacity(0.1),
                      child: const Icon(
                        Icons.person,
                        size: 60,
                        color: AppColors.primaryLight,
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: AppColors.primaryLight,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _nameController,
                validator: Validators.validateName,
                decoration: InputDecoration(
                  labelText: l10n?.name ?? 'Name',
                  prefixIcon: const Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                validator: Validators.validateEmail,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: l10n?.email ?? 'Email',
                  prefixIcon: const Icon(Icons.email_outlined),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                enabled: false,
                decoration: InputDecoration(
                  labelText: l10n?.phoneLabel ?? 'Phone',
                  prefixIcon: const Icon(Icons.phone_outlined),
                  suffixIcon: const Icon(Icons.lock_outline),
                ),
              ),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              Text(
                l10n?.vehicleInfo ?? 'Vehicle Information',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _vehicleTypeController,
                decoration: InputDecoration(
                  labelText: l10n?.vehicleType ?? 'Vehicle Type',
                  prefixIcon: const Icon(Icons.directions_car_outlined),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _licensePlateController,
                decoration: InputDecoration(
                  labelText: l10n?.licensePlate ?? 'License Plate',
                  prefixIcon: const Icon(Icons.pin_outlined),
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSave,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(l10n?.save ?? 'Save'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/custom_button.dart';
import '../../../../shared/widgets/custom_text_field.dart';
import '../providers/profile_provider.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _cityController;

  @override
  void initState() {
    super.initState();
    final profile = ref.read(profileProvider);
    _nameController = TextEditingController(text: profile.name ?? '');
    _emailController = TextEditingController(text: profile.email ?? '');
    _phoneController = TextEditingController(text: profile.phone ?? '');
    _cityController = TextEditingController(text: profile.city ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              SizedBox(height: 16.h),
              Stack(
                children: [
                  Container(
                    width: 100.r,
                    height: 100.r,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primaryContainer,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.person,
                      size: 50.r,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: EdgeInsets.all(6.r),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.camera_alt,
                        size: 16.r,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 24.h),
              CustomTextField(
                controller: _nameController,
                labelText: 'Full Name',
                prefixIconData: Icons.person_outlined,
              ),
              SizedBox(height: 16.h),
              CustomTextField(
                controller: _emailController,
                labelText: 'Email',
                prefixIconData: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16.h),
              CustomTextField(
                controller: _phoneController,
                labelText: 'Phone',
                prefixIconData: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              SizedBox(height: 16.h),
              CustomTextField(
                controller: _cityController,
                labelText: 'City',
                prefixIconData: Icons.location_city_outlined,
              ),
              SizedBox(height: 32.h),
              CustomButton(
                text: 'Update Profile',
                onPressed: () {
                  ref.read(profileProvider.notifier).updateProfile(
                        name: _nameController.text,
                        email: _emailController.text,
                        phone: _phoneController.text,
                        city: _cityController.text,
                      );
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Profile updated successfully')),
                  );
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

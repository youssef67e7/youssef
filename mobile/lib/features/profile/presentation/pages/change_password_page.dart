import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/custom_button.dart';
import '../../../../shared/widgets/custom_text_field.dart';

class ChangePasswordPage extends ConsumerStatefulWidget {
  const ChangePasswordPage({super.key});

  @override
  ConsumerState<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends ConsumerState<ChangePasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Change Password')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.r),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Enter your current password and set a new password.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              SizedBox(height: 24.h),
              CustomTextField(
                controller: _currentPasswordController,
                labelText: 'Current Password',
                prefixIconData: Icons.lock_outlined,
                obscureText: true,
              ),
              SizedBox(height: 16.h),
              CustomTextField(
                controller: _newPasswordController,
                labelText: 'New Password',
                prefixIconData: Icons.lock_outline,
                obscureText: true,
              ),
              SizedBox(height: 16.h),
              CustomTextField(
                controller: _confirmPasswordController,
                labelText: 'Confirm New Password',
                prefixIconData: Icons.lock_outline,
                obscureText: true,
                textInputAction: TextInputAction.done,
              ),
              SizedBox(height: 32.h),
              CustomButton(
                text: 'Update Password',
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Password updated successfully')),
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

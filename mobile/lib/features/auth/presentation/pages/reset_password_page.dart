import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/route_names.dart';
import '../../../../core/utils/validators.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../../../shared/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart' as feature_auth;

class ResetPasswordPage extends ConsumerStatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  ConsumerState<ResetPasswordPage> createState() =>
      _ResetPasswordPageState();
}

class _ResetPasswordPageState extends ConsumerState<ResetPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _tokenController = TextEditingController();

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _tokenController.dispose();
    super.dispose();
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(feature_auth.resetPasswordProvider.notifier).resetPassword(
          token: _tokenController.text.trim(),
          password: _passwordController.text,
          passwordConfirmation: _confirmPasswordController.text,
        );

    final state = ref.read(feature_auth.resetPasswordProvider);
    state.whenOrNull(
      data: (success) {
        if (success == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Password reset successfully'),
            ),
          );
          context.go(RouteNames.login);
        }
      },
      error: (error, _) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error.toString()),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(feature_auth.resetPasswordProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Reset Password'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Reset Password',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter the token from your email and set a new password.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
                const SizedBox(height: 32),
                CustomTextField(
                  controller: _tokenController,
                  labelText: 'Reset Token',
                  hintText: 'Enter token from email',
                  prefixIconData: Icons.vpn_key_outlined,
                  validator: (value) =>
                      Validators.required(value, 'Token'),
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _passwordController,
                  labelText: 'New Password',
                  hintText: 'Enter new password',
                  prefixIconData: Icons.lock_outlined,
                  obscureText: true,
                  validator: Validators.strongPassword,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _confirmPasswordController,
                  labelText: 'Confirm New Password',
                  hintText: 'Confirm new password',
                  prefixIconData: Icons.lock_outlined,
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  validator: (value) => Validators.confirmPassword(
                    value,
                    _passwordController.text,
                  ),
                ),
                const SizedBox(height: 24),
                CustomButton(
                  text: 'Reset Password',
                  isLoading: state.isLoading,
                  onPressed: _handleResetPassword,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

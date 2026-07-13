import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_strings.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/utils/validators.dart';
import '../../../../shared/providers/auth_provider.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../../../shared/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart' as feature_auth;

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(feature_auth.loginProvider.notifier).login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );

    final state = ref.read(feature_auth.loginProvider);
    state.whenOrNull(
      data: (user) {
        if (user != null) {
          context.go(RouteNames.home);
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
    final theme = Theme.of(context);
    final loginState = ref.watch(feature_auth.loginProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                Icon(
                  Icons.local_pharmacy,
                  size: 60,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(height: 24),
                Text(
                  AppStrings.login,
                  style: theme.textTheme.headlineLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Welcome back! Please login to your account.',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 40),
                CustomTextField(
                  controller: _emailController,
                  labelText: AppStrings.email,
                  hintText: AppStrings.enterEmail,
                  prefixIconData: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: Validators.email,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _passwordController,
                  labelText: AppStrings.password,
                  hintText: AppStrings.enterPassword,
                  prefixIconData: Icons.lock_outlined,
                  obscureText: true,
                  validator: Validators.password,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _handleLogin(),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: _rememberMe,
                          onChanged: (value) {
                            setState(() {
                              _rememberMe = value ?? false;
                            });
                          },
                        ),
                        Text(
                          AppStrings.rememberMe,
                          style: theme.textTheme.bodyMedium,
                        ),
                      ],
                    ),
                    TextButton(
                      onPressed: () =>
                          context.push(RouteNames.forgotPassword),
                      child: Text(AppStrings.forgotPassword),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                CustomButton(
                  text: AppStrings.login,
                  isLoading: loginState.isLoading,
                  onPressed: _handleLogin,
                ),
                const SizedBox(height: 24),
                Center(
                  child: Text(
                    AppStrings.orContinueWith,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          ref
                              .read(feature_auth.loginProvider.notifier)
                              .signInWithGoogle();
                        },
                        icon: const Icon(Icons.g_mobiledata, size: 24),
                        label: const Text('Google'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () =>
                            context.push(RouteNames.verifyPhone),
                        icon: const Icon(Icons.phone_outlined, size: 24),
                        label: const Text('Phone'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        AppStrings.dontHaveAccount,
                        style: theme.textTheme.bodyMedium,
                      ),
                      TextButton(
                        onPressed: () =>
                            context.push(RouteNames.register),
                        child: const Text(
                          AppStrings.register,
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

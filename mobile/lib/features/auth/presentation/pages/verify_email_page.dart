import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/route_names.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../providers/auth_provider.dart' as feature_auth;

class VerifyEmailPage extends ConsumerWidget {
  const VerifyEmailPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.mark_email_unread_outlined,
                  size: 60,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Verify Your Email',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.",
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              CustomButton(
                text: 'Open Email App',
                onPressed: () {},
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  ref
                      .read(feature_auth.loginProvider.notifier)
                      .resendVerificationEmail();
                },
                child: const Text("Didn't receive the email? Resend"),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => context.go(RouteNames.login),
                child: const Text('Back to Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

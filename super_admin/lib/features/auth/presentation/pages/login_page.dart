import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../core/utils/validators.dart';
import '../../../../shared/providers/auth_provider.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'admin@pharmaworld.com');
  final _passwordController = TextEditingController(text: 'Admin123!');
  final _mfaController = TextEditingController();
  bool _obscurePassword = true;
  bool _showMfa = false;
  String? _sessionToken;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _mfaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final loc = AppLocalizations.of(context);

    ref.listen<AuthState>(authStateProvider, (prev, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!), backgroundColor: Colors.red),
        );
        ref.read(authStateProvider.notifier).clearError();
      }
    });

    return Container(
      width: 420,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 40, offset: const Offset(0, 20))],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0xFF1B5E20).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.local_pharmacy, size: 36, color: Color(0xFF1B5E20)),
            ),
            const SizedBox(height: 20),
            Text(loc.translate('superAdminLogin'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(loc.translate('loginSubtitle'), style: TextStyle(fontSize: 14, color: Colors.grey[500])),
            const SizedBox(height: 32),
            if (!_showMfa) ...[
              TextFormField(
                controller: _emailController,
                validator: Validators.email,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: loc.translate('email'),
                  prefixIcon: const Icon(Icons.email_outlined),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                validator: Validators.password,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: loc.translate('password'),
                  prefixIcon: const Icon(Icons.lock_outlined),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Checkbox(value: true, onChanged: (_) {}),
                      Text(loc.translate('rememberMe'), style: const TextStyle(fontSize: 13)),
                    ],
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(loc.translate('forgotPassword')),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: authState.isLoading ? null : _handleLogin,
                  child: authState.isLoading
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text(loc.translate('login'), style: const TextStyle(fontSize: 16)),
                ),
              ),
            ] else ...[
              Text(loc.translate('enterMfaCode'), style: const TextStyle(fontSize: 14, color: Colors.grey)),
              const SizedBox(height: 20),
              TextFormField(
                controller: _mfaController,
                validator: Validators.mfaCode,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 6,
                style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  hintText: '------',
                  counterText: '',
                  prefixIcon: const Icon(Icons.security),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: authState.isLoading ? null : _handleMfa,
                  child: authState.isLoading
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text(loc.translate('verify'), style: const TextStyle(fontSize: 16)),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => setState(() {
                  _showMfa = false;
                  _sessionToken = null;
                }),
                child: const Text('Back to login'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    final success = await ref.read(authStateProvider.notifier).login(
      _emailController.text.trim(),
      _passwordController.text,
    );
    if (success && mounted) {
      context.go('/dashboard');
    } else if (mounted) {
      setState(() {
        _showMfa = true;
        _sessionToken = 'mock-session-token';
      });
    }
  }

  Future<void> _handleMfa() async {
    if (!_formKey.currentState!.validate()) return;
    if (_sessionToken == null) return;
    final success = await ref.read(authStateProvider.notifier).verifyMfa(
      _mfaController.text.trim(),
      _sessionToken!,
    );
    if (success && mounted) {
      context.go('/dashboard');
    }
  }
}

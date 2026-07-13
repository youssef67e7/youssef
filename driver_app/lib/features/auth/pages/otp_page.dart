import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pharmaworld_driver/core/localization/app_localizations.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:pharmaworld_driver/core/utils/snackbar_helper.dart';
import 'package:pharmaworld_driver/features/auth/provider/auth_provider.dart';
import 'package:pharmaworld_driver/shared/layouts/auth_layout.dart';

class OtpPage extends ConsumerStatefulWidget {
  final String phone;

  const OtpPage({super.key, required this.phone});

  @override
  ConsumerState<OtpPage> createState() => _OtpPageState();
}

class _OtpPageState extends ConsumerState<OtpPage> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isLoading = false;
  bool _canResend = false;
  int _resendSeconds = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    _timer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    _canResend = false;
    _resendSeconds = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          if (_resendSeconds > 0) {
            _resendSeconds--;
          } else {
            _canResend = true;
            timer.cancel();
          }
        });
      }
    });
  }

  String get _otpCode => _controllers.map((c) => c.text).join();

  Future<void> _handleVerify() async {
    if (_otpCode.length < 4) {
      SnackbarHelper.showError(context, 'Please enter the complete OTP');
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ref.read(otpProvider.notifier).verifyOtp(widget.phone, _otpCode);
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        SnackbarHelper.showError(context, e.toString());
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleResend() async {
    if (!_canResend) return;

    try {
      await ref.read(otpProvider.notifier).resendOtp(widget.phone);
      _startResendTimer();
      if (mounted) {
        SnackbarHelper.showSuccess(context, 'OTP resent successfully');
      }
    } catch (e) {
      if (mounted) {
        SnackbarHelper.showError(context, e.toString());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return AuthLayout(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(
              Icons.lock_outline,
              size: 80,
              color: AppColors.primaryLight,
            ),
            const SizedBox(height: 24),
            Text(
              l10n?.otpVerification ?? 'OTP Verification',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '${l10n?.enterOtp ?? 'Enter the OTP sent to'} ${widget.phone}',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(6, (index) {
                return SizedBox(
                  width: 48,
                  height: 56,
                  child: RawKeyboardListener(
                    focusNode: FocusNode(),
                    onKey: (event) {
                      if (event is RawKeyDownEvent &&
                          event.logicalKey == LogicalKeyboardKey.backspace &&
                          _controllers[index].text.isEmpty &&
                          index > 0) {
                        _controllers[index - 1].clear();
                        _focusNodes[index - 1].requestFocus();
                      }
                    },
                    child: TextField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 1,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                      decoration: InputDecoration(
                        counterText: '',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: AppColors.primaryLight,
                            width: 2,
                          ),
                        ),
                      ),
                      onChanged: (value) {
                        if (value.isNotEmpty && index < 5) {
                          _focusNodes[index + 1].requestFocus();
                        }
                        if (value.isEmpty && index > 0) {
                          _focusNodes[index - 1].requestFocus();
                        }
                        if (_otpCode.length == 6) {
                          _handleVerify();
                        }
                      },
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _handleVerify,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(l10n?.verifyOtp ?? 'Verify OTP'),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  l10n?.didntReceiveCode ?? "Didn't receive the code?",
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: _canResend ? _handleResend : null,
                  child: Text(
                    _canResend
                        ? (l10n?.resend ?? 'Resend')
                        : '$_resendSeconds s',
                    style: TextStyle(
                      color: _canResend ? AppColors.primaryLight : Colors.grey,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

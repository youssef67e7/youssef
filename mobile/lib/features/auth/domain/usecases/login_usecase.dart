import 'package:pharmaworld/features/auth/data/models/auth_models.dart';
import 'package:pharmaworld/features/auth/domain/repositories/auth_repository.dart';

class LoginUseCase {

  LoginUseCase(this._repository);
  final AuthRepository _repository;

  Future<AuthResponseModel?> call(LoginParams params) async {
    return await _repository.login(params.email, params.password);
  }

  Future<AuthResponseModel?> signInWithGoogle() async {
    return null;
  }

  Future<AuthResponseModel?> verifyOtp({required String otp}) async {
    return await _repository.verifyOtp(otp);
  }

  Future<void> resendVerificationEmail() async {
    await _repository.resendVerificationEmail();
  }
}

class LoginParams {

  const LoginParams({required this.email, required this.password});
  final String email;
  final String password;
}

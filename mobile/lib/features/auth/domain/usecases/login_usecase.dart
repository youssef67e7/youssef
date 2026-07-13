import '../models/auth_models.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository _repository;

  LoginUseCase(this._repository);

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
  final String email;
  final String password;

  const LoginParams({required this.email, required this.password});
}

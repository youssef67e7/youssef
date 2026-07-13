import 'package:pharmaworld/features/auth/data/models/auth_models.dart';
import 'package:pharmaworld/features/auth/domain/repositories/auth_repository.dart';

class RegisterUseCase {

  RegisterUseCase(this._repository);
  final AuthRepository _repository;

  Future<AuthResponseModel?> call(RegisterParams params) async {
    return await _repository.register(
      RegisterRequestModel(
        name: params.name,
        email: params.email,
        password: params.password,
        passwordConfirmation: params.passwordConfirmation,
        phone: params.phone,
      ),
    );
  }
}

class RegisterParams {

  const RegisterParams({
    required this.name,
    required this.email,
    required this.phone,
    required this.password,
    required this.passwordConfirmation,
  });
  final String name;
  final String email;
  final String phone;
  final String password;
  final String passwordConfirmation;
}

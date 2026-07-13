export interface AuthResult {
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface MfaRequiredResult {
  mfaRequired: true;
  mfaToken: string;
}

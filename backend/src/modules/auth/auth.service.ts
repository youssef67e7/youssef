import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../../common/enums/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingPhone = await this.userModel.findOne({ phone: dto.phone });
    if (existingPhone) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const referralCode = this.generateReferralCode();

    const user = new this.userModel({
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      password: hashedPassword,
      role: dto.role || UserRole.CUSTOMER,
      referralCode,
      referredBy: dto.referralCode ? await this.findReferrer(dto.referralCode) : null,
    });

    await user.save();

    const tokens = await this.generateTokens(user);

    this.logger.log(`New user registered: ${user.email}`);

    return {
      message: 'Registration successful',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({
      $or: [{ email: dto.email.toLowerCase() }, { phone: dto.email }],
    }).select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been deleted');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled) {
      const mfaToken = this.jwtService.sign(
        { userId: user._id, mfaPending: true },
        { expiresIn: '5m' },
      );
      return {
        message: 'MFA verification required',
        data: { mfaRequired: true, mfaToken },
      };
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      message: 'Login successful',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async verifyMfa(userId: string, code: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestException('MFA is not enabled');
    }

    const isValid = this.verifyTotpCode(user.mfaSecret, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const tokens = await this.generateTokens(user);

    return {
      message: 'MFA verification successful',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      return {
        message: 'Token refreshed successfully',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (user) {
      user.fcmToken = null as any;
      await user.save();
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    this.logger.log(`Password reset requested for: ${user.email}`);

    return {
      message: 'If the email exists, a reset link has been sent',
      data: { resetToken },
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const users = await this.userModel.find({
      passwordResetExpiry: { $gt: new Date() },
    });

    let matchedUser: UserDocument | null = null;
    for (const user of users) {
      if (user.passwordResetToken && await bcrypt.compare(token, user.passwordResetToken)) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    matchedUser.password = await bcrypt.hash(newPassword, 12);
    matchedUser.passwordResetToken = null as any;
    matchedUser.passwordResetExpiry = null as any;
    await matchedUser.save();

    this.logger.log(`Password reset completed for: ${matchedUser.email}`);

    return { message: 'Password reset successful' };
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({ emailVerificationToken: token });
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.isEmailVerified = true;
    user.isVerified = true;
    user.emailVerificationToken = null as any;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async verifyPhone(userId: string, otp: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.phoneVerificationOtp) {
      throw new BadRequestException('No OTP sent');
    }

    if (user.phoneOtpExpiry && user.phoneOtpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.phoneVerificationOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    user.isPhoneVerified = true;
    user.isVerified = true;
    user.phoneVerificationOtp = null as any;
    user.phoneOtpExpiry = null as any;
    await user.save();

    return { message: 'Phone verified successfully' };
  }

  async sendOtp(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    user.phoneVerificationOtp = otpHash;
    user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    this.logger.log(`OTP sent to: ${user.phone}`);

    return {
      message: 'OTP sent successfully',
      data: { otp },
    };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User profile retrieved',
      data: this.sanitizeUser(user),
    };
  }

  private async generateTokens(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'default_jwt_secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  private generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private async findReferrer(code: string) {
    const referrer = await this.userModel.findOne({ referralCode: code });
    return referrer ? referrer._id : null;
  }

  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject();
    obj.id = obj._id.toString();
    delete obj.password;
    delete obj.mfaSecret;
    delete obj.passwordResetToken;
    delete obj.emailVerificationToken;
    delete obj.phoneVerificationOtp;
    return obj;
  }

  private verifyTotpCode(secret: string, code: string): boolean {
    const time = Math.floor(Date.now() / 30000);
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(time));

    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base64'));
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const otpValue = ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = (otpValue % 1000000).toString().padStart(6, '0');
    return otp === code;
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
class UserAddress {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true, default: 'Egypt' })
  country: string;

  @Prop()
  phone: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: { type: Number }, coordinates: [Number] })
  location: { type: string; coordinates: number[] };
}

@Schema({ _id: false })
class UserDevice {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  platform: string;

  @Prop()
  model: string;

  @Prop({ default: Date.now })
  lastActive: Date;
}

@Schema({ _id: false })
class UserPreferences {
  @Prop({ default: 'en' })
  language: string;

  @Prop({ default: false })
  darkMode: boolean;

  @Prop({ default: true })
  notifications: boolean;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: true })
  smsNotifications: boolean;
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'DRIVER', 'CUSTOMER'], default: 'CUSTOMER' })
  role: string;

  @Prop({ default: null })
  avatar: string;

  @Prop({ type: [UserAddress], default: [] })
  addresses: UserAddress[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: null })
  fcmToken: string;

  @Prop({ default: null })
  lastLogin: Date;

  @Prop({ default: 0 })
  loginCount: number;

  @Prop({ unique: true, sparse: true })
  referralCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  referredBy: Types.ObjectId;

  @Prop({ default: 0 })
  walletBalance: number;

  @Prop({ default: 0 })
  loyaltyPoints: number;

  @Prop({ type: UserPreferences, default: () => ({}) })
  preferences: UserPreferences;

  @Prop({ default: false })
  mfaEnabled: boolean;

  @Prop({ default: null })
  mfaSecret: string;

  @Prop({ type: [UserDevice], default: [] })
  devices: UserDevice[];

  @Prop({ default: null })
  emailVerificationToken: string;

  @Prop({ default: null })
  phoneVerificationOtp: string;

  @Prop({ default: null })
  phoneOtpExpiry: Date;

  @Prop({ default: null })
  passwordResetToken: string;

  @Prop({ default: null })
  passwordResetExpiry: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ referralCode: 1 });
UserSchema.index({ name: 'text', email: 'text' });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ createdAt: -1 });

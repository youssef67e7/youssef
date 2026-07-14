import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DriverProfileDocument = DriverProfile & Document;

@Schema({ timestamps: true, collection: 'driver_profiles' })
export class DriverProfile {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ enum: ['MOTORCYCLE', 'CAR', 'VAN', 'BICYCLE'], default: 'MOTORCYCLE' })
  vehicleType: string;

  @Prop({ default: '' })
  licenseNumber: string;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: Object, default: null })
  currentLocation: any;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalDeliveries: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const DriverProfileSchema = SchemaFactory.createForClass(DriverProfile);

DriverProfileSchema.index({ email: 1 });
DriverProfileSchema.index({ isOnline: 1 });
DriverProfileSchema.index({ isActive: 1 });
DriverProfileSchema.index({ deletedAt: 1 });
DriverProfileSchema.index({ createdAt: -1 });

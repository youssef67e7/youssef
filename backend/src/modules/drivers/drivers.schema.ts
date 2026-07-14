import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DriverDocument = Driver & Document;

@Schema({ timestamps: true, collection: 'drivers' })
export class Driver {
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

  @Prop({ type: { lat: { type: Number }, lng: { type: Number } }, default: null })
  currentLocation: { lat: number; lng: number };

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

export const DriverSchema = SchemaFactory.createForClass(Driver);

DriverSchema.index({ email: 1 });
DriverSchema.index({ isOnline: 1 });
DriverSchema.index({ isActive: 1 });
DriverSchema.index({ deletedAt: 1 });
DriverSchema.index({ createdAt: -1 });

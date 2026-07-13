import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DriverDocument = Driver & Document;

@Schema({ _id: false })
class DriverLocation {
  @Prop({ type: Number })
  lat: number;

  @Prop({ type: Number })
  lng: number;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

@Schema({ timestamps: true, collection: 'drivers' })
export class Driver {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ type: String, enum: ['MOTORCYCLE', 'CAR', 'VAN', 'BICYCLE'], default: 'MOTORCYCLE' })
  vehicleType: string;

  @Prop({ default: '' })
  vehicleNumber: string;

  @Prop({ required: true })
  licenseNumber: string;

  @Prop({ required: true })
  licenseExpiry: Date;

  @Prop({ type: [String], default: [] })
  documents: string[];

  @Prop({ type: DriverLocation, default: () => ({}) })
  currentLocation: DriverLocation;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ default: 0 })
  totalDeliveries: number;

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null })
  currentOrder: Types.ObjectId;

  @Prop({ default: '' })
  zone: string;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);

DriverSchema.index({ user: 1 });
DriverSchema.index({ isAvailable: 1 });
DriverSchema.index({ isOnline: 1 });
DriverSchema.index({ zone: 1 });
DriverSchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });
DriverSchema.index({ createdAt: -1 });

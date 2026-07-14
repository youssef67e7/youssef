import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TelemedDoctorDocument = TelemedDoctor & Document;

@Schema({ timestamps: true, collection: 'telemed_doctors' })
export class TelemedDoctor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ required: true })
  specialization: string;

  @Prop({ default: '' })
  qualification: string;

  @Prop({ default: 0 })
  experience: number;

  @Prop({ default: 0 })
  consultationFee: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalConsultations: number;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: [String], default: [] })
  availableDays: string[];

  @Prop({ default: '09:00' })
  availableFrom: string;

  @Prop({ default: '17:00' })
  availableTo: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const TelemedDoctorSchema = SchemaFactory.createForClass(TelemedDoctor);

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true, collection: 'appointments' })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TelemedDoctor', required: true })
  doctor: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], default: 'PENDING' })
  status: string;

  @Prop({ enum: ['VIDEO', 'AUDIO', 'CHAT'], default: 'VIDEO' })
  type: string;

  @Prop({ default: '' })
  reason: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: '' })
  prescription: string;

  @Prop({ default: 0 })
  consultationFee: number;

  @Prop({ enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' })
  paymentStatus: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

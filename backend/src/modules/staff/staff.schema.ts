import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StaffDocument = Staff & Document;

export enum StaffRole {
  PHARMACIST = 'PHARMACIST',
  CASHIER = 'CASHIER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  DELIVERY_STAFF = 'DELIVERY_STAFF',
}

@Schema({ timestamps: true, collection: 'staff' })
export class Staff {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ enum: StaffRole, required: true })
  role: StaffRole;

  @Prop({ default: '' })
  department: string;

  @Prop({ default: 0 })
  salary: number;

  @Prop({ default: Date.now })
  joinDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);

StaffSchema.index({ email: 1 });
StaffSchema.index({ role: 1 });
StaffSchema.index({ isActive: 1 });
StaffSchema.index({ deletedAt: 1 });
StaffSchema.index({ createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true, collection: 'addresses' })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, enum: ['home', 'work', 'other'] })
  label: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ default: 'Egypt' })
  country: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: Number })
  latitude: number;

  @Prop({ type: Number })
  longitude: number;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

AddressSchema.index({ user: 1 });
AddressSchema.index({ user: 1, isDefault: 1 });
AddressSchema.index({ user: 1, isDeleted: 1 });
AddressSchema.index({ createdAt: -1 });

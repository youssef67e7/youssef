import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;

class SupplierAddress {
  @Prop({ default: '' })
  street: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  state: string;

  @Prop({ default: '' })
  zipCode: string;

  @Prop({ default: '' })
  country: string;
}

@Schema({ timestamps: true, collection: 'suppliers' })
export class Supplier {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  contactPerson: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ type: SupplierAddress, default: () => ({}) })
  address: SupplierAddress;

  @Prop({ default: '' })
  taxId: string;

  @Prop({ default: '' })
  paymentTerms: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: '' })
  notes: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.index({ name: 1 });
SupplierSchema.index({ isActive: 1 });
SupplierSchema.index({ name: 'text' });
SupplierSchema.index({ createdAt: -1 });

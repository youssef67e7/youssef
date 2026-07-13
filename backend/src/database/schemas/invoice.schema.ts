import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ _id: false })
class InvoiceItem {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicine: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  total: number;
}

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [InvoiceItem], required: true })
  items: InvoiceItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  tax: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: String, enum: ['CASH_ON_DELIVERY', 'CREDIT_CARD', 'DEBIT_CARD', 'STRIPE', 'PAYMOB', 'FAWRY', 'WALLET', 'BANK_TRANSFER'], required: true })
  paymentMethod: string;

  @Prop({ type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' })
  paymentStatus: string;

  @Prop()
  paidAt: Date;

  @Prop()
  dueDate: Date;

  @Prop({ default: '' })
  notes: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ order: 1 });
InvoiceSchema.index({ user: 1 });
InvoiceSchema.index({ paymentStatus: 1 });
InvoiceSchema.index({ createdAt: -1 });

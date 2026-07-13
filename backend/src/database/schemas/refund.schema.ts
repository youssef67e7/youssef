import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefundDocument = Refund & Document;

@Schema({ timestamps: true, collection: 'refunds' })
export class Refund {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  status: string;

  @Prop({ type: String, enum: ['STRIPE', 'PAYMOB', 'WALLET', 'BANK_TRANSFER', 'CASH'], required: true })
  refundMethod: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  processedBy: Types.ObjectId;

  @Prop()
  processedAt: Date;

  @Prop({ default: '' })
  transactionId: string;

  @Prop({ default: '' })
  notes: string;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);

RefundSchema.index({ order: 1 });
RefundSchema.index({ user: 1 });
RefundSchema.index({ status: 1 });
RefundSchema.index({ refundMethod: 1 });
RefundSchema.index({ createdAt: -1 });

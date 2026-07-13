import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExchangeRequestDocument = ExchangeRequest & Document;

@Schema({ _id: false })
class ExchangeItem {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicine: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ default: '' })
  reason: string;
}

@Schema({ timestamps: true, collection: 'exchange_requests' })
export class ExchangeRequest {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [ExchangeItem], required: true })
  originalItems: ExchangeItem[];

  @Prop({ type: [ExchangeItem], required: true })
  replacementItems: ExchangeItem[];

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'ITEM_RECEIVED', 'REPLACEMENT_SHIPPED', 'COMPLETED', 'CANCELLED'], default: 'PENDING' })
  status: string;

  @Prop({ default: 0 })
  priceDifference: number;

  @Prop({ default: '' })
  adminNotes: string;
}

export const ExchangeRequestSchema = SchemaFactory.createForClass(ExchangeRequest);

ExchangeRequestSchema.index({ order: 1 });
ExchangeRequestSchema.index({ user: 1 });
ExchangeRequestSchema.index({ status: 1 });
ExchangeRequestSchema.index({ createdAt: -1 });

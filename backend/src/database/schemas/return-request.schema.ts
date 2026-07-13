import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReturnRequestDocument = ReturnRequest & Document;

@Schema({ _id: false })
class ReturnItem {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicine: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ default: '' })
  reason: string;
}

@Schema({ timestamps: true, collection: 'return_requests' })
export class ReturnRequest {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [ReturnItem], required: true })
  items: ReturnItem[];

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'ITEM_RECEIVED', 'REFUND_INITIATED', 'COMPLETED', 'CANCELLED'], default: 'PENDING' })
  status: string;

  @Prop({ default: 0, min: 0 })
  refundAmount: number;

  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  refundStatus: string;

  @Prop({ default: '' })
  adminNotes: string;

  @Prop({ default: '' })
  returnTrackingNumber: string;

  @Prop()
  returnReceivedAt: Date;

  @Prop()
  refundProcessedAt: Date;
}

export const ReturnRequestSchema = SchemaFactory.createForClass(ReturnRequest);

ReturnRequestSchema.index({ order: 1 });
ReturnRequestSchema.index({ user: 1 });
ReturnRequestSchema.index({ status: 1 });
ReturnRequestSchema.index({ refundStatus: 1 });
ReturnRequestSchema.index({ createdAt: -1 });

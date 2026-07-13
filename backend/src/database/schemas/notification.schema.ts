import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  titleAr: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: '' })
  bodyAr: string;

  @Prop({ type: String, enum: ['ORDER_UPDATE', 'PAYMENT_UPDATE', 'DELIVERY_UPDATE', 'PROMOTION', 'SYSTEM', 'WALLET', 'LOYALTY', 'REVIEW', 'SUPPORT', 'REFERRAL'], required: true })
  type: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: null })
  readAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ user: 1 });
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });

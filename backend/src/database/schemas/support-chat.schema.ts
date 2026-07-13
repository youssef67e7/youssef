import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportChatDocument = SupportChat & Document;

@Schema({ _id: false })
class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ default: false })
  isRead: boolean;
}

@Schema({ timestamps: true, collection: 'support_chats' })
export class SupportChat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' })
  status: string;

  @Prop({ type: [ChatMessage], default: [] })
  messages: ChatMessage[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId;

  @Prop({ type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  priority: string;

  @Prop({ type: String, enum: ['ORDER', 'PAYMENT', 'DELIVERY', 'PRODUCT', 'ACCOUNT', 'OTHER'], default: 'OTHER' })
  category: string;
}

export const SupportChatSchema = SchemaFactory.createForClass(SupportChat);

SupportChatSchema.index({ user: 1 });
SupportChatSchema.index({ status: 1 });
SupportChatSchema.index({ assignedTo: 1 });
SupportChatSchema.index({ priority: 1 });
SupportChatSchema.index({ createdAt: -1 });

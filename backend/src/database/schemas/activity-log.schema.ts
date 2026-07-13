import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: { createdAt: true }, collection: 'activity_logs' })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  user: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;

  @Prop({ default: '' })
  ipAddress: string;

  @Prop({ default: '' })
  userAgent: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

ActivityLogSchema.index({ user: 1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ createdAt: -1 });

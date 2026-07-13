import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemSettingDocument = SystemSetting & Document;

@Schema({ timestamps: { updatedAt: true }, collection: 'system_settings' })
export class SystemSetting {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop({ type: String, enum: ['string', 'number', 'boolean', 'json'], default: 'string' })
  type: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: false })
  isPublic: boolean;
}

export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);

SystemSettingSchema.index({ key: 1 });
SystemSettingSchema.index({ isPublic: 1 });
SystemSettingSchema.index({ type: 1 });

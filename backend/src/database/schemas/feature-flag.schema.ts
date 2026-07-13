import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeatureFlagDocument = FeatureFlag & Document;

@Schema({ timestamps: true, collection: 'feature_flags' })
export class FeatureFlag {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: false })
  isEnabled: boolean;

  @Prop({ default: 100, min: 0, max: 100 })
  rolloutPercentage: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  allowedUsers: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  allowedRoles: string[];
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);

FeatureFlagSchema.index({ name: 1 });
FeatureFlagSchema.index({ isEnabled: 1 });

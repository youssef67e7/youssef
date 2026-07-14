import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromotionDocument = Promotion & Document;

@Schema({ timestamps: true, collection: 'promotions' })
export class Promotion {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ enum: ['PERCENTAGE', 'FIXED', 'BOGO', 'FREE_SHIPPING', 'BUY_X_GET_Y'], required: true })
  type: string;

  @Prop({ required: true })
  value: number;

  @Prop({ default: 0 })
  minPurchase: number;

  @Prop({ default: 0 })
  maxDiscount: number;

  @Prop({ default: 0 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ default: 1 })
  perUserLimit: number;

  @Prop({ type: [{ type: String }], default: [] })
  applicableMedicines: string[];

  @Prop({ type: [{ type: String }], default: [] })
  applicableCategories: string[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  priority: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);

PromotionSchema.index({ isActive: 1 });
PromotionSchema.index({ startDate: 1, endDate: 1 });
PromotionSchema.index({ deletedAt: 1 });
PromotionSchema.index({ createdAt: -1 });

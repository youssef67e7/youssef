import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: true, collection: 'offers' })
export class Offer {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  nameAr: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  descriptionAr: string;

  @Prop({ type: String, enum: ['PERCENTAGE', 'FIXED', 'BUY_X_GET_Y'], required: true })
  discountType: string;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ default: 0 })
  buyQuantity: number;

  @Prop({ default: 0 })
  getQuantity: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Medicine' }], default: [] })
  applicableMedicines: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  applicableCategories: Types.ObjectId[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: -1 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

OfferSchema.index({ isActive: 1 });
OfferSchema.index({ startDate: 1, endDate: 1 });
OfferSchema.index({ discountType: 1 });
OfferSchema.index({ deletedAt: 1 });
OfferSchema.index({ createdAt: -1 });

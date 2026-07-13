import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true, collection: 'coupons' })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  nameAr: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  descriptionAr: string;

  @Prop({ type: String, enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BUY_X_GET_Y'], required: true })
  type: string;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ default: 0, min: 0 })
  minimumOrderAmount: number;

  @Prop({ default: 0, min: 0 })
  maximumDiscountAmount: number;

  @Prop({ default: -1 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  applicableCategories: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Medicine' }], default: [] })
  applicableMedicines: Types.ObjectId[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSingleUse: boolean;

  @Prop({ default: 1 })
  perUserLimit: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1 });
CouponSchema.index({ startDate: 1, endDate: 1 });
CouponSchema.index({ type: 1 });
CouponSchema.index({ deletedAt: 1 });
CouponSchema.index({ createdAt: -1 });

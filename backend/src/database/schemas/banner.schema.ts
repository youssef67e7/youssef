import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true, collection: 'banners' })
export class Banner {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  titleAr: string;

  @Prop({ required: true })
  image: string;

  @Prop({ default: '' })
  link: string;

  @Prop({ type: String, enum: ['MEDICINE', 'CATEGORY', 'OFFER', 'EXTERNAL', 'NONE'], default: 'NONE' })
  linkType: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: 0 })
  impressions: number;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ isActive: 1 });
BannerSchema.index({ sortOrder: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });
BannerSchema.index({ deletedAt: 1 });
BannerSchema.index({ createdAt: -1 });

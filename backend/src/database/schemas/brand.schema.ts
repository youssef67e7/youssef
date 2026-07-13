import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true, collection: 'brands' })
export class Brand {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  nameAr: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ default: '' })
  logo: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  descriptionAr: string;

  @Prop({ default: '' })
  countryOfOrigin: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  productCount: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.index({ slug: 1 });
BrandSchema.index({ isActive: 1 });
BrandSchema.index({ name: 'text', nameAr: 'text' });
BrandSchema.index({ deletedAt: 1 });
BrandSchema.index({ createdAt: -1 });

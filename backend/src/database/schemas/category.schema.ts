import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  nameAr: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  descriptionAr: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentCategory: Types.ObjectId;

  @Prop({ default: 0 })
  level: number;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  productCount: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ name: 'text', nameAr: 'text' });
CategorySchema.index({ deletedAt: 1 });
CategorySchema.index({ createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicineDocument = Medicine & Document;

@Schema({ _id: false })
class MedicineImage {
  @Prop({ required: true })
  url: string;

  @Prop()
  alt: string;

  @Prop({ default: false })
  isPrimary: boolean;
}

@Schema({ timestamps: true, collection: 'medicines' })
export class Medicine {
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

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand', default: null })
  brand: Types.ObjectId;

  @Prop({ default: '' })
  activeIngredient: string;

  @Prop({ default: '' })
  activeIngredientAr: string;

  @Prop({ type: String, enum: ['TABLET', 'CAPSULE', 'LIQUID', 'SYRUP', 'SUSPENSION', 'INJECTION', 'DROPS', 'CREAM', 'OINTMENT', 'GEL', 'SUPPOSITORY', 'INHALER', 'PATCH', 'POWDER', 'SPRAY', 'SOLUTION', 'EYE_DROPS', 'EAR_DROPS', 'NASAL_SPRAY', 'TOPICAL'], required: true })
  dosageForm: string;

  @Prop({ required: true })
  strength: string;

  @Prop({ default: '' })
  manufacturer: string;

  @Prop({ default: '' })
  manufacturerAr: string;

  @Prop({ default: '' })
  barcode: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ type: [MedicineImage], default: [] })
  images: MedicineImage[];

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  priceAfterDiscount: number;

  @Prop({ default: 0, min: 0 })
  costPrice: number;

  @Prop({ default: 0, min: 0 })
  wholesalePrice: number;

  @Prop({ default: 0, min: 0 })
  profitMargin: number;

  @Prop({ required: true, min: 0, default: 0 })
  stockQuantity: number;

  @Prop({ default: 10 })
  minimumStockLevel: number;

  @Prop({ default: 1000 })
  maximumStockLevel: number;

  @Prop({ default: 20 })
  reorderPoint: number;

  @Prop({ default: false })
  isPrescriptionRequired: boolean;

  @Prop({ default: false })
  isControlled: boolean;

  @Prop({ default: false })
  requiresColdChain: boolean;

  @Prop({ default: '' })
  storageConditions: string;

  @Prop({ type: [String], default: [] })
  sideEffects: string[];

  @Prop({ type: [String], default: [] })
  contraindications: string[];

  @Prop({ type: [String], default: [] })
  interactions: string[];

  @Prop({ default: '' })
  dosageInstructions: string;

  @Prop({ default: '' })
  dosageInstructionsAr: string;

  @Prop()
  expiryDate: Date;

  @Prop({ default: '' })
  batchNumber: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ default: 0 })
  totalSold: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '' })
  seoTitle: string;

  @Prop({ default: '' })
  seoDescription: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);

MedicineSchema.index({ name: 'text', nameAr: 'text', description: 'text', activeIngredient: 'text', tags: 'text' });
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ brand: 1 });
MedicineSchema.index({ price: 1 });
MedicineSchema.index({ stockQuantity: 1 });
MedicineSchema.index({ isActive: 1 });
MedicineSchema.index({ isFeatured: 1 });
MedicineSchema.index({ expiryDate: 1 });
MedicineSchema.index({ barcode: 1 });
MedicineSchema.index({ slug: 1 });
MedicineSchema.index({ createdAt: -1 });
MedicineSchema.index({ averageRating: -1 });
MedicineSchema.index({ totalSold: -1 });
MedicineSchema.index({ deletedAt: 1 });
MedicineSchema.index({ dosageForm: 1 });

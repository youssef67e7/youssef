import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicine: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  comment: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 0 })
  helpfulCount: number;

  @Prop({ default: 0 })
  unhelpfulCount: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  reportedBy: Types.ObjectId[];

  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'], default: 'PENDING' })
  status: string;

  @Prop({ default: '' })
  adminReply: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ user: 1 });
ReviewSchema.index({ medicine: 1 });
ReviewSchema.index({ order: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ user: 1, medicine: 1, order: 1 }, { unique: true });
ReviewSchema.index({ deletedAt: 1 });
ReviewSchema.index({ createdAt: -1 });

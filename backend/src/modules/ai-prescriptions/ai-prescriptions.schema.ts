import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrescriptionAnalysisDocument = PrescriptionAnalysis & Document;

@Schema({ timestamps: true, collection: 'prescription_analyses' })
export class PrescriptionAnalysis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({ default: '' })
  rawText: string;

  @Prop({ type: [{ name: String, dosage: String, frequency: String, duration: String, notes: String }], default: [] })
  medicines: { name: string; dosage: string; frequency: string; duration: string; notes: string }[];

  @Prop({ default: '' })
  diagnosis: string;

  @Prop({ default: '' })
  doctorName: string;

  @Prop({ default: null })
  prescribedDate: Date;

  @Prop({ enum: ['ANALYZING', 'COMPLETED', 'FAILED'], default: 'ANALYZING' })
  status: string;

  @Prop({ default: 0 })
  confidence: number;

  @Prop({ type: [String], default: [] })
  warnings: string[];
}

export const PrescriptionAnalysisSchema = SchemaFactory.createForClass(PrescriptionAnalysis);

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrescriptionAnalysis, PrescriptionAnalysisDocument } from './ai-prescriptions.schema';

const MOCK_MEDICINES = [
  { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: '3 times daily', duration: '7 days', notes: 'Take with food' },
  { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Every 6 hours', duration: '5 days', notes: 'For pain relief' },
  { name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once daily', duration: '10 days', notes: 'For allergy symptoms' },
];

const MOCK_DIAGNOSES = [
  'Upper respiratory tract infection',
  'Bacterial infection',
  'Allergic rhinitis',
  'Acute bronchitis',
];

@Injectable()
export class AiPrescriptionsService {
  constructor(
    @InjectModel(PrescriptionAnalysis.name) private model: Model<PrescriptionAnalysisDocument>,
  ) {}

  async analyze(userId: string, dto: any) {
    const record = await this.model.create({
      user: userId,
      imageUrl: dto.imageUrl || '',
      rawText: dto.rawText || '',
      doctorName: dto.doctorName || '',
      prescribedDate: dto.prescribedDate || new Date(),
      status: 'COMPLETED',
      medicines: MOCK_MEDICINES.slice(0, Math.floor(Math.random() * 3) + 1),
      diagnosis: MOCK_DIAGNOSES[Math.floor(Math.random() * MOCK_DIAGNOSES.length)],
      confidence: Math.floor(Math.random() * 20) + 80,
      warnings: Math.random() > 0.7 ? ['Drug interaction detected between Amoxicillin and Warfarin'] : [],
    });
    return { message: 'Prescription analyzed successfully', data: record };
  }

  async getHistory(userId: string, query: any = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const filter = { user: userId };
    const total = await this.model.countDocuments(filter);
    const data = await this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();
    return { message: 'History retrieved', data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getOne(id: string) {
    const record = await this.model.findById(id).exec();
    return { message: 'Analysis retrieved', data: record };
  }
}

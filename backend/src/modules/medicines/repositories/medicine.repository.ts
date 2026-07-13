import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Medicine, MedicineDocument } from '../../../database/schemas/medicine.schema';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';

@Injectable()
export class MedicineRepository {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async findById(id: string): Promise<MedicineDocument | null> {
    return this.medicineModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<MedicineDocument | null> {
    return this.medicineModel.findOne({ slug }).exec();
  }

  async findByBarcode(barcode: string): Promise<MedicineDocument | null> {
    return this.medicineModel.findOne({ barcode }).exec();
  }

  async findBySku(sku: string): Promise<MedicineDocument | null> {
    return this.medicineModel.findOne({ sku }).exec();
  }

  async create(data: Partial<Medicine>): Promise<MedicineDocument> {
    const medicine = new this.medicineModel(data);
    return medicine.save();
  }

  async update(id: string, data: Partial<Medicine>): Promise<MedicineDocument | null> {
    return this.medicineModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.medicineModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
  }

  async paginate(filter: FilterQuery<MedicineDocument>, options: { page: number; limit: number; sort: any }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.medicineModel.find(filter).sort(options.sort).skip(skip).limit(limit).exec(),
      this.medicineModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findLowStock(): Promise<MedicineDocument[]> {
    return this.medicineModel
      .find({ deletedAt: null, $expr: { $lte: ['$stockQuantity', '$reorderPoint'] } })
      .sort({ stockQuantity: 1 })
      .exec();
  }

  async findExpiring(days: number = 30): Promise<MedicineDocument[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.medicineModel
      .find({
        deletedAt: null,
        expiryDate: { $lte: futureDate, $gt: new Date() },
      })
      .sort({ expiryDate: 1 })
      .exec();
  }

  async findFeatured(): Promise<MedicineDocument[]> {
    return this.medicineModel
      .find({ deletedAt: null, isActive: true, isFeatured: true })
      .sort({ totalSold: -1 })
      .limit(20)
      .exec();
  }

  async count(filter: FilterQuery<MedicineDocument> = {}): Promise<number> {
    return this.medicineModel.countDocuments(filter).exec();
  }

  async logAudit(data: {
    user?: string;
    action: string;
    entity: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const log = new this.auditLogModel(data);
    await log.save();
  }
}

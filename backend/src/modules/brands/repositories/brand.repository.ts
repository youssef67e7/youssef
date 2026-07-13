import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Brand, BrandDocument } from '../../../database/schemas/brand.schema';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';

@Injectable()
export class BrandRepository {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async findById(id: string): Promise<BrandDocument | null> {
    return this.brandModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<BrandDocument | null> {
    return this.brandModel.findOne({ slug }).exec();
  }

  async create(data: Partial<Brand>): Promise<BrandDocument> {
    const brand = new this.brandModel(data);
    return brand.save();
  }

  async update(id: string, data: Partial<Brand>): Promise<BrandDocument | null> {
    return this.brandModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.brandModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
  }

  async paginate(filter: FilterQuery<BrandDocument>, options: { page: number; limit: number; sort: any }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.brandModel.find(filter).sort(options.sort).skip(skip).limit(limit).exec(),
      this.brandModel.countDocuments(filter).exec(),
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

  async incrementProductCount(id: string, amount: number = 1): Promise<void> {
    await this.brandModel.findByIdAndUpdate(id, { $inc: { productCount: amount } }).exec();
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

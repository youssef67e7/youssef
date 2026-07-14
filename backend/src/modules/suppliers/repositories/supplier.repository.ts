import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Supplier, SupplierDocument } from '../../../database/schemas/supplier.schema';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';

@Injectable()
export class SupplierRepository {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async findById(id: string): Promise<SupplierDocument | null> {
    return this.supplierModel.findById(id).exec();
  }

  async create(data: Partial<Supplier>): Promise<SupplierDocument> {
    const supplier = new this.supplierModel(data);
    return supplier.save();
  }

  async update(id: string, data: Partial<Supplier>): Promise<SupplierDocument | null> {
    return this.supplierModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async paginate(filter: FilterQuery<SupplierDocument>, options: { page: number; limit: number; sort: any }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.supplierModel.find(filter).sort(options.sort).skip(skip).limit(limit).exec(),
      this.supplierModel.countDocuments(filter).exec(),
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

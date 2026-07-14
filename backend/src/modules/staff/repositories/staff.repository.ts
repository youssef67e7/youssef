import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Staff, StaffDocument } from '../staff.schema';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';

@Injectable()
export class StaffRepository {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async findById(id: string): Promise<StaffDocument | null> {
    return this.staffModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<StaffDocument | null> {
    return this.staffModel.findOne({ email }).exec();
  }

  async create(data: Partial<Staff>): Promise<StaffDocument> {
    const staff = new this.staffModel(data);
    return staff.save();
  }

  async update(id: string, data: Partial<Staff>): Promise<StaffDocument | null> {
    return this.staffModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.staffModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
  }

  async paginate(filter: FilterQuery<StaffDocument>, options: { page: number; limit: number; sort: any }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.staffModel.find(filter).sort(options.sort).skip(skip).limit(limit).exec(),
      this.staffModel.countDocuments(filter).exec(),
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

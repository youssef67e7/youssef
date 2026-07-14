import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver, DriverDocument } from '../drivers.schema';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';

@Injectable()
export class DriverRepository {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async findAll(filter: any = {}, sort: any = { createdAt: -1 }) {
    return this.driverModel.find(filter).sort(sort).exec();
  }

  async findById(id: string) {
    return this.driverModel.findById(id).exec();
  }

  async create(data: any) {
    return this.driverModel.create(data);
  }

  async update(id: string, data: any) {
    return this.driverModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async softDelete(id: string) {
    return this.driverModel.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() }, { new: true }).exec();
  }

  async count(filter: any = {}) {
    return this.driverModel.countDocuments(filter).exec();
  }

  async paginate(filter: any, options: { page: number; limit: number; sort?: any }) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const total = await this.count(filter);
    const data = await this.driverModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async logAudit(data: any) {
    try { await this.auditModel.create(data); } catch {}
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from '../promotions.schema';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';

@Injectable()
export class PromotionRepository {
  constructor(
    @InjectModel(Promotion.name) private promoModel: Model<PromotionDocument>,
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async findAll(filter: any = {}, sort: any = { createdAt: -1 }) {
    return this.promoModel.find(filter).sort(sort).exec();
  }

  async findById(id: string) {
    return this.promoModel.findById(id).exec();
  }

  async create(data: any) {
    return this.promoModel.create(data);
  }

  async update(id: string, data: any) {
    return this.promoModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async softDelete(id: string) {
    return this.promoModel.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() }, { new: true }).exec();
  }

  async count(filter: any = {}) {
    return this.promoModel.countDocuments(filter).exec();
  }

  async paginate(filter: any, options: { page: number; limit: number; sort?: any }) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const total = await this.count(filter);
    const data = await this.promoModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async logAudit(data: any) {
    try { await this.auditModel.create(data); } catch {}
  }
}

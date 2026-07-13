import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../../database/schemas/category.schema';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async findById(id: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ slug }).exec();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ deletedAt: null }).sort({ sortOrder: 1 }).exec();
  }

  async findAllActive(): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ deletedAt: null, isActive: true }).sort({ sortOrder: 1 }).exec();
  }

  async findByParent(parentId: string): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ parentCategory: parentId, deletedAt: null }).exec();
  }

  async create(data: Partial<Category>): Promise<CategoryDocument> {
    const category = new this.categoryModel(data);
    return category.save();
  }

  async update(id: string, data: Partial<Category>): Promise<CategoryDocument | null> {
    return this.categoryModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
  }

  async incrementProductCount(id: string, amount: number = 1): Promise<void> {
    await this.categoryModel.findByIdAndUpdate(id, { $inc: { productCount: amount } }).exec();
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

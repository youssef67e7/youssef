import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../database/schemas/audit-log.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async findAll(query: PaginationDto & { entity?: string; action?: string; userId?: string }) {
    const filter: any = {};

    if (query.entity) filter.entity = query.entity;
    if (query.action) filter.action = query.action;
    if (query.userId) filter.user = query.userId;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.auditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Audit logs retrieved',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findByEntity(entity: string, entityId: string) {
    const logs = await this.auditLogModel
      .find({ entity, entityId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .exec();

    return {
      message: 'Entity audit logs retrieved',
      data: logs,
    };
  }

  async log(data: {
    user?: string;
    action: string;
    entity: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const log = await this.auditLogModel.create(data);
    this.logger.log(`Audit log: ${data.action} on ${data.entity}:${data.entityId}`);
    return log;
  }
}

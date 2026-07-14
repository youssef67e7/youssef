import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PromotionRepository } from './repositories/promotion.repository';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(private readonly repo: PromotionRepository) {}

  async create(dto: CreatePromotionDto, adminId: string) {
    const promo = await this.repo.create(dto);
    await this.repo.logAudit({ user: adminId, action: 'CREATE_PROMOTION', entity: 'Promotion', entityId: promo._id.toString(), newValues: dto });
    return { message: 'Promotion created', data: promo };
  }

  async findAll(query: any = {}) {
    const filter: any = { deletedAt: null };
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    const result = await this.repo.paginate(filter, { page, limit });
    return { message: 'Promotions retrieved', data: result.data, meta: result.meta };
  }

  async findActive() {
    const now = new Date();
    const data = await this.repo.findAll({ isActive: true, deletedAt: null, startDate: { $lte: now }, endDate: { $gte: now } });
    return { message: 'Active promotions', data };
  }

  async findById(id: string) {
    const promo = await this.repo.findById(id);
    if (!promo || promo.deletedAt) throw new NotFoundException('Promotion not found');
    return { message: 'Promotion retrieved', data: promo };
  }

  async update(id: string, dto: UpdatePromotionDto, adminId: string) {
    const promo = await this.repo.findById(id);
    if (!promo || promo.deletedAt) throw new NotFoundException('Promotion not found');
    const updated = await this.repo.update(id, dto);
    await this.repo.logAudit({ user: adminId, action: 'UPDATE_PROMOTION', entity: 'Promotion', entityId: id, newValues: dto });
    return { message: 'Promotion updated', data: updated };
  }

  async remove(id: string, adminId: string) {
    const promo = await this.repo.findById(id);
    if (!promo || promo.deletedAt) throw new NotFoundException('Promotion not found');
    await this.repo.softDelete(id);
    await this.repo.logAudit({ user: adminId, action: 'DELETE_PROMOTION', entity: 'Promotion', entityId: id });
    return { message: 'Promotion deleted' };
  }

  async toggleActive(id: string) {
    const promo = await this.repo.findById(id);
    if (!promo || promo.deletedAt) throw new NotFoundException('Promotion not found');
    const updated = await this.repo.update(id, { isActive: !promo.isActive });
    return { message: `Promotion ${updated?.isActive ? 'activated' : 'deactivated'}`, data: updated };
  }
}

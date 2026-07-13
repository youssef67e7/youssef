import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { BrandRepository } from './repositories/brand.repository';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import slug from 'slug';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(private readonly brandRepository: BrandRepository) {}

  async create(dto: CreateBrandDto, adminId: string) {
    const brandSlug = slug(dto.name, { lower: true });

    const existing = await this.brandRepository.findBySlug(brandSlug);
    if (existing) {
      throw new BadRequestException('Brand with this name already exists');
    }

    const brand = await this.brandRepository.create({
      ...dto,
      slug: brandSlug,
    });

    await this.brandRepository.logAudit({
      user: adminId,
      action: 'CREATE_BRAND',
      entity: 'Brand',
      entityId: brand._id.toString(),
      newValues: dto,
    });

    this.logger.log(`Brand created: ${brand.name}`);

    return {
      message: 'Brand created successfully',
      data: brand,
    };
  }

  async findAll(query: PaginationDto) {
    const filter = { deletedAt: null };

    const result = await this.brandRepository.paginate(filter, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sort: { [query.sortBy as string]: query.sortOrder === 'asc' ? 1 : -1 },
    });

    return {
      message: 'Brands retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  async findById(id: string) {
    const brand = await this.brandRepository.findById(id);
    if (!brand || brand.deletedAt) {
      throw new NotFoundException('Brand not found');
    }

    return {
      message: 'Brand retrieved successfully',
      data: brand,
    };
  }

  async update(id: string, dto: UpdateBrandDto, adminId: string) {
    const brand = await this.brandRepository.findById(id);
    if (!brand || brand.deletedAt) {
      throw new NotFoundException('Brand not found');
    }

    if (dto.name) {
      (dto as any).slug = slug(dto.name, { lower: true });
    }

    const updated = await this.brandRepository.update(id, dto as any);

    await this.brandRepository.logAudit({
      user: adminId,
      action: 'UPDATE_BRAND',
      entity: 'Brand',
      entityId: id,
      oldValues: brand.toObject(),
      newValues: dto,
    });

    this.logger.log(`Brand ${id} updated by admin ${adminId}`);

    return {
      message: 'Brand updated successfully',
      data: updated,
    };
  }

  async remove(id: string, adminId: string) {
    const brand = await this.brandRepository.findById(id);
    if (!brand || brand.deletedAt) {
      throw new NotFoundException('Brand not found');
    }

    await this.brandRepository.softDelete(id);

    await this.brandRepository.logAudit({
      user: adminId,
      action: 'DELETE_BRAND',
      entity: 'Brand',
      entityId: id,
      oldValues: { deletedAt: null },
      newValues: { deletedAt: new Date() },
    });

    this.logger.log(`Brand ${id} soft deleted by admin ${adminId}`);

    return { message: 'Brand deleted successfully' };
  }
}

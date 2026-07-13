import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../../database/schemas/banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {}

  async create(dto: CreateBannerDto, adminId: string) {
    const banner = await this.bannerModel.create(dto);

    this.logger.log(`Banner created: ${banner.title} by admin ${adminId}`);

    return {
      message: 'Banner created successfully',
      data: banner,
    };
  }

  async findAll(query: PaginationDto) {
    const filter = { deletedAt: null };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.bannerModel.find(filter).sort({ sortOrder: 1 }).skip(skip).limit(limit).exec(),
      this.bannerModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Banners retrieved',
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

  async findActive() {
    const now = new Date();
    const banners = await this.bannerModel.find({
      isActive: true,
      deletedAt: null,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
      ],
    }).sort({ sortOrder: 1 });

    return {
      message: 'Active banners retrieved',
      data: banners,
    };
  }

  async trackImpression(id: string) {
    await this.bannerModel.findByIdAndUpdate(id, { $inc: { impressions: 1 } });
    return { message: 'Impression tracked' };
  }

  async trackClick(id: string) {
    await this.bannerModel.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    return { message: 'Click tracked' };
  }

  async findById(id: string) {
    const banner = await this.bannerModel.findById(id);
    if (!banner || banner.deletedAt) {
      throw new NotFoundException('Banner not found');
    }

    return {
      message: 'Banner retrieved',
      data: banner,
    };
  }

  async update(id: string, dto: UpdateBannerDto, adminId: string) {
    const banner = await this.bannerModel.findById(id);
    if (!banner || banner.deletedAt) {
      throw new NotFoundException('Banner not found');
    }

    const updated = await this.bannerModel.findByIdAndUpdate(id, { $set: dto }, { new: true });

    this.logger.log(`Banner ${id} updated by admin ${adminId}`);

    return {
      message: 'Banner updated successfully',
      data: updated,
    };
  }

  async remove(id: string, adminId: string) {
    const banner = await this.bannerModel.findById(id);
    if (!banner || banner.deletedAt) {
      throw new NotFoundException('Banner not found');
    }

    await this.bannerModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

    this.logger.log(`Banner ${id} soft deleted by admin ${adminId}`);

    return { message: 'Banner deleted successfully' };
  }
}

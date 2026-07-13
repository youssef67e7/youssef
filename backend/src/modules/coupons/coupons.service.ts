import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../../database/schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(dto: CreateCouponDto, adminId: string) {
    const existing = await this.couponModel.findOne({ code: dto.code.toUpperCase() });
    if (existing) {
      throw new BadRequestException('Coupon with this code already exists');
    }

    const coupon = await this.couponModel.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });

    this.logger.log(`Coupon created: ${coupon.code} by admin ${adminId}`);

    return {
      message: 'Coupon created successfully',
      data: coupon,
    };
  }

  async findAll(query: PaginationDto) {
    const filter = { deletedAt: null };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.couponModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.couponModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Coupons retrieved',
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

  async findById(id: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon || coupon.deletedAt) {
      throw new NotFoundException('Coupon not found');
    }

    return {
      message: 'Coupon retrieved',
      data: coupon,
    };
  }

  async validate(code: string, orderAmount: number, userId: string) {
    const coupon = await this.couponModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
      deletedAt: null,
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (coupon.startDate > new Date()) {
      throw new BadRequestException('Coupon is not yet active');
    }

    if (coupon.endDate < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minimumOrderAmount > 0 && orderAmount < coupon.minimumOrderAmount) {
      throw new BadRequestException(`Minimum order amount is ${coupon.minimumOrderAmount}`);
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maximumDiscountAmount > 0 && discount > coupon.maximumDiscountAmount) {
        discount = coupon.maximumDiscountAmount;
      }
    } else if (coupon.type === 'FIXED') {
      discount = Math.min(coupon.discountValue, orderAmount);
    }

    return {
      message: 'Coupon is valid',
      data: {
        coupon,
        discount: Math.round(discount * 100) / 100,
        finalAmount: Math.round((orderAmount - discount) * 100) / 100,
      },
    };
  }

  async update(id: string, dto: UpdateCouponDto, adminId: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon || coupon.deletedAt) {
      throw new NotFoundException('Coupon not found');
    }

    if (dto.code) {
      dto.code = dto.code.toUpperCase();
    }

    const updated = await this.couponModel.findByIdAndUpdate(id, { $set: dto }, { new: true });

    this.logger.log(`Coupon ${id} updated by admin ${adminId}`);

    return {
      message: 'Coupon updated successfully',
      data: updated,
    };
  }

  async remove(id: string, adminId: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon || coupon.deletedAt) {
      throw new NotFoundException('Coupon not found');
    }

    await this.couponModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

    this.logger.log(`Coupon ${id} soft deleted by admin ${adminId}`);

    return { message: 'Coupon deleted successfully' };
  }
}

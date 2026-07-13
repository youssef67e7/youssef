import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer, OfferDocument } from '../../database/schemas/offer.schema';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
  ) {}

  async create(dto: CreateOfferDto, adminId: string) {
    if (dto.startDate >= dto.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const offer = await this.offerModel.create(dto);

    this.logger.log(`Offer created: ${offer.name} by admin ${adminId}`);

    return {
      message: 'Offer created successfully',
      data: offer,
    };
  }

  async findAll(query: PaginationDto) {
    const filter = { deletedAt: null };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.offerModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.offerModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Offers retrieved',
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
    const offers = await this.offerModel.find({
      isActive: true,
      deletedAt: null,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    return {
      message: 'Active offers retrieved',
      data: offers,
    };
  }

  async findById(id: string) {
    const offer = await this.offerModel.findById(id);
    if (!offer || offer.deletedAt) {
      throw new NotFoundException('Offer not found');
    }

    return {
      message: 'Offer retrieved',
      data: offer,
    };
  }

  async calculateDiscount(offerId: string, medicinePrice: number, quantity: number) {
    const offer = await this.offerModel.findById(offerId);
    if (!offer || !offer.isActive || offer.deletedAt) {
      return { discount: 0, totalDiscount: 0 };
    }

    let discount = 0;

    if (offer.discountType === 'PERCENTAGE') {
      discount = (medicinePrice * quantity * offer.discountValue) / 100;
    } else if (offer.discountType === 'FIXED') {
      discount = offer.discountValue * quantity;
    } else if (offer.discountType === 'BUY_X_GET_Y') {
      if (quantity >= offer.buyQuantity + offer.getQuantity) {
        const freeItems = Math.floor(quantity / (offer.buyQuantity + offer.getQuantity)) * offer.getQuantity;
        discount = medicinePrice * freeItems;
      }
    }

    return {
      discount: Math.round(discount * 100) / 100,
      totalDiscount: Math.round(discount * 100) / 100,
    };
  }

  async update(id: string, dto: UpdateOfferDto, adminId: string) {
    const offer = await this.offerModel.findById(id);
    if (!offer || offer.deletedAt) {
      throw new NotFoundException('Offer not found');
    }

    const updated = await this.offerModel.findByIdAndUpdate(id, { $set: dto }, { new: true });

    this.logger.log(`Offer ${id} updated by admin ${adminId}`);

    return {
      message: 'Offer updated successfully',
      data: updated,
    };
  }

  async remove(id: string, adminId: string) {
    const offer = await this.offerModel.findById(id);
    if (!offer || offer.deletedAt) {
      throw new NotFoundException('Offer not found');
    }

    await this.offerModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

    this.logger.log(`Offer ${id} soft deleted by admin ${adminId}`);

    return { message: 'Offer deleted successfully' };
  }
}

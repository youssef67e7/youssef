import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';
import { Medicine, MedicineDocument } from '../../database/schemas/medicine.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const medicine = await this.medicineModel.findById(dto.medicine);
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundException('Medicine not found');
    }

    const existingReview = await this.reviewModel.findOne({
      user: userId,
      medicine: dto.medicine,
      order: dto.order,
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this medicine for this order');
    }

    const review = await this.reviewModel.create({
      user: userId,
      medicine: dto.medicine,
      order: dto.order,
      rating: dto.rating,
      title: dto.title || '',
      comment: dto.comment || '',
      images: dto.images || [],
      isVerified: true,
      status: 'APPROVED',
    });

    await this.updateMedicineRating(dto.medicine);

    this.logger.log(`Review created by user ${userId} for medicine ${dto.medicine}`);

    return {
      message: 'Review created successfully',
      data: review,
    };
  }

  async findAll(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };

    const [data, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user', 'name email avatar')
        .populate('medicine', 'name')
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Reviews retrieved',
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByMedicine(medicineId: string, query: PaginationDto) {
    const filter = { medicine: medicineId, status: 'APPROVED', deletedAt: null };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user', 'name avatar')
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    const ratingDistribution = await this.reviewModel.aggregate([
      { $match: { medicine: medicineId, status: 'APPROVED' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    return {
      message: 'Reviews retrieved',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      ratingDistribution,
    };
  }

  async findById(id: string) {
    const review = await this.reviewModel.findById(id)
      .populate('user', 'name avatar')
      .populate('medicine', 'name')
      .exec();

    if (!review || review.deletedAt) {
      throw new NotFoundException('Review not found');
    }

    return {
      message: 'Review retrieved',
      data: review,
    };
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.reviewModel.findById(id);
    if (!review || review.deletedAt) {
      throw new NotFoundException('Review not found');
    }

    if (review.user.toString() !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updated = await this.reviewModel.findByIdAndUpdate(id, { $set: dto }, { new: true });
    await this.updateMedicineRating(review.medicine.toString());

    return {
      message: 'Review updated successfully',
      data: updated,
    };
  }

  async remove(id: string, userId: string) {
    const review = await this.reviewModel.findById(id);
    if (!review || review.deletedAt) {
      throw new NotFoundException('Review not found');
    }

    if (review.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });
    await this.updateMedicineRating(review.medicine.toString());

    return { message: 'Review deleted successfully' };
  }

  async markHelpful(id: string, userId: string) {
    const review = await this.reviewModel.findById(id);
    if (!review || review.deletedAt) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewModel.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } });

    return { message: 'Marked as helpful' };
  }

  async adminReply(id: string, reply: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.reviewModel.findByIdAndUpdate(
      id,
      { $set: { adminReply: reply } },
      { new: true },
    );

    return {
      message: 'Admin reply added',
      data: updated,
    };
  }

  async updateStatus(id: string, status: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.reviewModel.findByIdAndUpdate(id, { $set: { status } }, { new: true });

    return {
      message: 'Review status updated',
      data: updated,
    };
  }

  private async updateMedicineRating(medicineId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { medicine: medicineId, status: 'APPROVED', deletedAt: null } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await this.medicineModel.findByIdAndUpdate(medicineId, {
        $set: {
          averageRating: Math.round(result[0].averageRating * 10) / 10,
          totalReviews: result[0].totalReviews,
        },
      });
    } else {
      await this.medicineModel.findByIdAndUpdate(medicineId, {
        $set: { averageRating: 0, totalReviews: 0 },
      });
    }
  }
}

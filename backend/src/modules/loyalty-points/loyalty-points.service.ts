import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoyaltyPoints, LoyaltyPointsDocument } from '../../database/schemas/loyalty-points.schema';

@Injectable()
export class LoyaltyPointsService {
  private readonly logger = new Logger(LoyaltyPointsService.name);

  constructor(
    @InjectModel(LoyaltyPoints.name) private loyaltyModel: Model<LoyaltyPointsDocument>,
  ) {}

  private readonly tierThresholds = {
    BRONZE: 0,
    SILVER: 500,
    GOLD: 2000,
    PLATINUM: 5000,
  };

  private readonly tierMultipliers = {
    BRONZE: 1,
    SILVER: 1.5,
    GOLD: 2,
    PLATINUM: 3,
  };

  async getBalance(userId: string) {
    let loyalty = await this.loyaltyModel.findOne({ user: userId });
    if (!loyalty) {
      loyalty = await this.loyaltyModel.create({
        user: userId,
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        tier: 'BRONZE',
        transactions: [],
      });
    }

    return {
      message: 'Loyalty points balance retrieved',
      data: {
        points: loyalty.points,
        totalEarned: loyalty.totalEarned,
        totalRedeemed: loyalty.totalRedeemed,
        tier: loyalty.tier,
        tierExpiry: loyalty.tierExpiry,
      },
    };
  }

  async earnPoints(userId: string, orderId: string, orderAmount: number) {
    let loyalty = await this.loyaltyModel.findOne({ user: userId });
    if (!loyalty) {
      loyalty = await this.loyaltyModel.create({
        user: userId,
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        tier: 'BRONZE',
        transactions: [],
      });
    }

    const multiplier = (this.tierMultipliers as any)[loyalty.tier] || 1;
    const pointsToEarn = Math.floor((orderAmount / 10) * multiplier);

    loyalty.points += pointsToEarn;
    loyalty.totalEarned += pointsToEarn;
    loyalty.transactions.push({
      type: 'EARNED',
      points: pointsToEarn,
      description: `Earned from order - ${orderAmount} EGP`,
      orderId,
      createdAt: new Date(),
    } as any);

    const newTier = this.calculateTier(loyalty.totalEarned);
    if (newTier !== loyalty.tier) {
      loyalty.tier = newTier;
      loyalty.tierExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    await loyalty.save();

    this.logger.log(`Loyalty points earned: ${userId} +${pointsToEarn}`);

    return {
      message: 'Points earned successfully',
      data: {
        pointsEarned: pointsToEarn,
        totalPoints: loyalty.points,
        tier: loyalty.tier,
      },
    };
  }

  async redeemPoints(userId: string, points: number, orderId: string) {
    const loyalty = await this.loyaltyModel.findOne({ user: userId });
    if (!loyalty) {
      throw new NotFoundException('Loyalty account not found');
    }

    if (loyalty.points < points) {
      throw new BadRequestException('Insufficient loyalty points');
    }

    if (points <= 0) {
      throw new BadRequestException('Points must be greater than 0');
    }

    loyalty.points -= points;
    loyalty.totalRedeemed += points;
    loyalty.transactions.push({
      type: 'REDEEMED',
      points,
      description: `Redeemed for order discount`,
      orderId,
      createdAt: new Date(),
    } as any);

    await loyalty.save();

    this.logger.log(`Loyalty points redeemed: ${userId} -${points}`);

    return {
      message: 'Points redeemed successfully',
      data: {
        pointsRedeemed: points,
        remainingPoints: loyalty.points,
        discountAmount: points,
      },
    };
  }

  async getTierBenefits(userId: string) {
    const loyalty = await this.loyaltyModel.findOne({ user: userId });
    const tier = loyalty?.tier || 'BRONZE';

    const benefits = {
      BRONZE: {
        name: 'Bronze',
        multiplier: '1x',
        freeDeliveryThreshold: 500,
        discountPercentage: 0,
        exclusiveOffers: false,
        earlyAccess: false,
      },
      SILVER: {
        name: 'Silver',
        multiplier: '1.5x',
        freeDeliveryThreshold: 300,
        discountPercentage: 2,
        exclusiveOffers: false,
        earlyAccess: false,
      },
      GOLD: {
        name: 'Gold',
        multiplier: '2x',
        freeDeliveryThreshold: 200,
        discountPercentage: 5,
        exclusiveOffers: true,
        earlyAccess: false,
      },
      PLATINUM: {
        name: 'Platinum',
        multiplier: '3x',
        freeDeliveryThreshold: 0,
        discountPercentage: 10,
        exclusiveOffers: true,
        earlyAccess: true,
      },
    };

    return {
      message: 'Tier benefits retrieved',
      data: {
        currentTier: tier,
        benefits: (benefits as any)[tier],
        nextTier: this.getNextTier(tier),
        pointsToNextTier: this.getPointsToNextTier(loyalty?.totalEarned || 0, tier),
      },
    };
  }

  async getTransactionHistory(userId: string, query: any) {
    const loyalty = await this.loyaltyModel.findOne({ user: userId });
    if (!loyalty) {
      throw new NotFoundException('Loyalty account not found');
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const transactions = loyalty.transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice((page - 1) * limit, page * limit);

    return {
      message: 'Transaction history retrieved',
      data: {
        transactions,
        total: loyalty.transactions.length,
        page,
        limit,
      },
    };
  }

  private calculateTier(totalEarned: number): string {
    if (totalEarned >= this.tierThresholds.PLATINUM) return 'PLATINUM';
    if (totalEarned >= this.tierThresholds.GOLD) return 'GOLD';
    if (totalEarned >= this.tierThresholds.SILVER) return 'SILVER';
    return 'BRONZE';
  }

  private getNextTier(currentTier: string): string | null {
    const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  private getPointsToNextTier(totalEarned: number, currentTier: string): number {
    const nextTier = this.getNextTier(currentTier);
    if (!nextTier) return 0;
    return (this.tierThresholds as any)[nextTier] - totalEarned;
  }
}

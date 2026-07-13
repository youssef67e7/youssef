import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Referral, ReferralDocument } from '../../database/schemas/referral.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Wallet, WalletDocument } from '../../database/schemas/wallet.schema';

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);
  private readonly REFERRAL_REWARD = 50;

  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
  ) {}

  async getMyCode(userId: string) {
    const user = await this.userModel.findById(userId).select('referralCode');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.referralCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      user.referralCode = code;
      await user.save();
    }

    return {
      message: 'Referral code retrieved',
      data: { code: user.referralCode },
    };
  }

  async applyReferral(userId: string, code: string) {
    const referrer = await this.userModel.findOne({ referralCode: code });
    if (!referrer) {
      throw new NotFoundException('Invalid referral code');
    }

    if (referrer._id.toString() === userId) {
      throw new BadRequestException('Cannot refer yourself');
    }

    const existingReferral = await this.referralModel.findOne({ referred: userId });
    if (existingReferral) {
      throw new BadRequestException('You have already been referred');
    }

    const referral = await this.referralModel.create({
      referrer: referrer._id,
      referred: userId,
      code,
      rewardAmount: this.REFERRAL_REWARD,
    });

    await this.creditReward(referrer._id.toString(), `Referral reward for referring a new user`);
    await this.creditReward(userId, `Welcome bonus for using referral code`);

    this.logger.log(`Referral applied: ${referrer._id} referred ${userId}`);

    return {
      message: 'Referral applied successfully',
      data: referral,
    };
  }

  async getReferralHistory(userId: string) {
    const referrals = await this.referralModel.find({ referrer: userId })
      .populate('referred', 'name email createdAt')
      .sort({ createdAt: -1 });

    const totalEarnings = referrals.reduce((sum, r) => sum + r.rewardAmount, 0);

    return {
      message: 'Referral history retrieved',
      data: {
        referrals,
        totalReferrals: referrals.length,
        totalEarnings,
      },
    };
  }

  async getReferralStats(userId: string) {
    const referralCount = await this.referralModel.countDocuments({ referrer: userId }).exec();
    const referrals = await this.referralModel.find({ referrer: userId });
    const totalEarnings = referrals.reduce((sum, r) => sum + r.rewardAmount, 0);

    return {
      message: 'Referral stats retrieved',
      data: {
        referralCount,
        totalEarnings,
        rewardPerReferral: this.REFERRAL_REWARD,
      },
    };
  }

  private async creditReward(userId: string, description: string) {
    let wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet) {
      wallet = await this.walletModel.create({ user: userId, balance: 0, transactions: [] });
    }

    const balanceBefore = wallet.balance;
    wallet.balance += this.REFERRAL_REWARD;
    wallet.transactions.push({
      type: 'REFERRAL_BONUS',
      amount: this.REFERRAL_REWARD,
      description,
      balanceBefore,
      balanceAfter: wallet.balance,
      createdAt: new Date(),
    } as any);
    await wallet.save();
  }
}

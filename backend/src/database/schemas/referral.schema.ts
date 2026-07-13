import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralDocument = Referral & Document;

@Schema({ timestamps: true, collection: 'referrals' })
export class Referral {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  referrer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  referred: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ default: 0 })
  referralCount: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  rewardAmount: number;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);

ReferralSchema.index({ referrer: 1 });
ReferralSchema.index({ referred: 1 });
ReferralSchema.index({ code: 1 });
ReferralSchema.index({ isActive: 1 });
ReferralSchema.index({ createdAt: -1 });

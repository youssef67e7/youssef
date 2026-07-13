import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoyaltyPointsDocument = LoyaltyPoints & Document;

@Schema({ _id: false })
class LoyaltyTransaction {
  @Prop({ type: String, enum: ['EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED', 'REFERRAL_BONUS'], required: true })
  type: string;

  @Prop({ required: true })
  points: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null })
  orderId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true, collection: 'loyalty_points' })
export class LoyaltyPoints {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  points: number;

  @Prop({ default: 0 })
  totalEarned: number;

  @Prop({ default: 0 })
  totalRedeemed: number;

  @Prop({ type: [LoyaltyTransaction], default: [] })
  transactions: LoyaltyTransaction[];

  @Prop({ type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'], default: 'BRONZE' })
  tier: string;

  @Prop()
  tierExpiry: Date;
}

export const LoyaltyPointsSchema = SchemaFactory.createForClass(LoyaltyPoints);

LoyaltyPointsSchema.index({ user: 1 });
LoyaltyPointsSchema.index({ tier: 1 });
LoyaltyPointsSchema.index({ points: -1 });
LoyaltyPointsSchema.index({ createdAt: -1 });

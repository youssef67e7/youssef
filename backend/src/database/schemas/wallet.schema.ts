import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ _id: false })
class WalletTransaction {
  @Prop({ type: String, enum: ['CREDIT', 'DEBIT', 'REFUND', 'WITHDRAWAL', 'TOP_UP', 'ORDER_PAYMENT', 'REFERRAL_BONUS', 'LOYALTY_REDEMPTION', 'ADMIN_ADJUSTMENT'], required: true })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ default: null })
  referenceId: string;

  @Prop({ default: null })
  referenceModel: string;

  @Prop({ required: true })
  balanceBefore: number;

  @Prop({ required: true })
  balanceAfter: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true, collection: 'wallets' })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  balance: number;

  @Prop({ default: 'EGP' })
  currency: string;

  @Prop({ type: [WalletTransaction], default: [] })
  transactions: WalletTransaction[];

  @Prop({ default: true })
  isActive: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.index({ user: 1 });
WalletSchema.index({ balance: 1 });
WalletSchema.index({ isActive: 1 });
WalletSchema.index({ createdAt: -1 });

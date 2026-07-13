import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicine: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: Object, default: {} })
  medicineSnapshot: Record<string, any>;
}

@Schema({ _id: false })
class OrderAddress {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ default: 'Egypt' })
  country: string;

  @Prop()
  phone: string;

  @Prop()
  name: string;

  @Prop({ type: { type: Number }, coordinates: [Number] })
  location: { type: string; coordinates: number[] };
}

@Schema({ _id: false })
class StatusHistory {
  @Prop({ required: true })
  status: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ default: '' })
  note: string;
}

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  deliveryFee: number;

  @Prop({ default: 0, min: 0 })
  tax: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: Types.ObjectId, ref: 'Coupon', default: null })
  coupon: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  couponDiscount: number;

  @Prop({ type: String, enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED', 'EXCHANGED'], default: 'PENDING' })
  status: string;

  @Prop({ type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED'], default: 'PENDING' })
  paymentStatus: string;

  @Prop({ type: String, enum: ['CASH_ON_DELIVERY', 'CREDIT_CARD', 'DEBIT_CARD', 'STRIPE', 'PAYMOB', 'FAWRY', 'WALLET', 'BANK_TRANSFER'], default: 'CASH_ON_DELIVERY' })
  paymentMethod: string;

  @Prop({ default: null })
  paymentId: string;

  @Prop({ type: OrderAddress, required: true })
  shippingAddress: OrderAddress;

  @Prop({ type: Types.ObjectId, ref: 'Address', default: null })
  deliveryAddress: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Driver', default: null })
  driver: Types.ObjectId;

  @Prop()
  estimatedDeliveryTime: Date;

  @Prop()
  actualDeliveryTime: Date;

  @Prop({ default: '' })
  deliveryInstructions: string;

  @Prop({ default: '' })
  trackingNumber: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: '' })
  internalNotes: string;

  @Prop({ default: false })
  isGift: boolean;

  @Prop({ default: '' })
  giftMessage: string;

  @Prop({ type: [StatusHistory], default: [] })
  statusHistory: StatusHistory[];

  @Prop({ type: Types.ObjectId, ref: 'ReturnRequest', default: null })
  returnRequest: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ExchangeRequest', default: null })
  exchangeRequest: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Refund', default: null })
  refundRequest: Types.ObjectId;

  @Prop({ default: 0 })
  loyaltyPointsEarned: number;

  @Prop({ default: 0 })
  loyaltyPointsUsed: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ paymentMethod: 1 });
OrderSchema.index({ driver: 1 });
OrderSchema.index({ coupon: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ deletedAt: 1 });
OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ user: 1, createdAt: -1 });

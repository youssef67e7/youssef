import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeliveryDocument = Delivery & Document;

@Schema({ _id: false })
class DeliveryStatusHistory {
  @Prop({ required: true })
  status: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ default: '' })
  note: string;
}

@Schema({ timestamps: true, collection: 'deliveries' })
export class Delivery {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true })
  driver: Types.ObjectId;

  @Prop({ type: String, enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED'], default: 'PENDING' })
  status: string;

  @Prop({ type: Object, default: {} })
  pickupAddress: Record<string, any>;

  @Prop({ type: Object, default: {} })
  deliveryAddress: Record<string, any>;

  @Prop({ default: 0 })
  estimatedDistance: number;

  @Prop({ default: 0 })
  estimatedDuration: number;

  @Prop({ default: 0 })
  actualDistance: number;

  @Prop({ default: 0 })
  actualDuration: number;

  @Prop({ default: 0 })
  deliveryFee: number;

  @Prop({ default: 0 })
  tip: number;

  @Prop()
  pickupTime: Date;

  @Prop()
  deliveryTime: Date;

  @Prop({ type: [DeliveryStatusHistory], default: [] })
  statusHistory: DeliveryStatusHistory[];
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);

DeliverySchema.index({ order: 1 });
DeliverySchema.index({ driver: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ createdAt: -1 });
DeliverySchema.index({ driver: 1, status: 1 });

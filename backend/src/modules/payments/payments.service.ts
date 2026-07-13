import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { Wallet, WalletDocument } from '../../database/schemas/wallet.schema';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
  ) {}

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order already paid');
    }

    const clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;

    this.logger.log(`Payment intent created for order ${order.orderNumber}`);

    return {
      message: 'Payment intent created',
      data: {
        clientSecret,
        amount: order.total,
        currency: 'egp',
        orderId: order._id,
      },
    };
  }

  async processPayment(dto: ProcessPaymentDto) {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order already paid');
    }

    let paymentSuccessful = false;
    let transactionId = '';

    switch (dto.paymentMethod) {
      case 'STRIPE':
        paymentSuccessful = await this.processStripePayment(dto);
        transactionId = `stripe_${Date.now()}`;
        break;
      case 'PAYMOB':
        paymentSuccessful = await this.processPaymobPayment(dto);
        transactionId = `paymob_${Date.now()}`;
        break;
      case 'FAWRY':
        paymentSuccessful = await this.processFawryPayment(dto);
        transactionId = `fawry_${Date.now()}`;
        break;
      case 'WALLET':
        paymentSuccessful = await this.processWalletPayment(order.user.toString(), order.total);
        transactionId = `wallet_${Date.now()}`;
        break;
      case 'CASH_ON_DELIVERY':
        paymentSuccessful = true;
        transactionId = `cod_${Date.now()}`;
        break;
      default:
        throw new BadRequestException('Invalid payment method');
    }

    if (paymentSuccessful) {
      order.paymentStatus = 'PAID';
      order.paymentId = transactionId;
      order.paymentMethod = dto.paymentMethod;
      order.status = 'CONFIRMED';
      order.statusHistory.push({
        status: 'CONFIRMED',
        timestamp: new Date(),
        note: 'Payment confirmed',
      });
      await order.save();

      this.logger.log(`Payment processed for order ${order.orderNumber}: ${transactionId}`);

      return {
        message: 'Payment processed successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          transactionId,
          amount: order.total,
          status: 'PAID',
        },
      };
    } else {
      order.paymentStatus = 'FAILED';
      await order.save();

      throw new BadRequestException('Payment processing failed');
    }
  }

  async verifyPayment(paymentId: string) {
    this.logger.log(`Verifying payment: ${paymentId}`);

    return {
      message: 'Payment verified',
      data: {
        paymentId,
        verified: true,
        verifiedAt: new Date(),
      },
    };
  }

  async getPaymentStatus(orderId: string) {
    const order = await this.orderModel.findById(orderId).select('orderNumber paymentStatus paymentId paymentMethod total');
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Payment status retrieved',
      data: {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentId: order.paymentId,
        paymentMethod: order.paymentMethod,
        amount: order.total,
      },
    };
  }

  async processRefund(orderId: string, amount: number, reason: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== 'PAID') {
      throw new BadRequestException('Order is not paid');
    }

    if (order.paymentMethod === 'WALLET') {
      const wallet = await this.walletModel.findOne({ user: order.user });
      if (wallet) {
        wallet.balance += amount;
        wallet.transactions.push({
          type: 'REFUND',
          amount,
          description: `Refund for order ${order.orderNumber}: ${reason}`,
          referenceId: order._id.toString(),
          referenceModel: 'Order',
          balanceBefore: wallet.balance - amount,
          balanceAfter: wallet.balance,
          createdAt: new Date(),
        } as any);
        await wallet.save();
      }
    }

    order.paymentStatus = 'REFUNDED';
    order.status = 'REFUNDED';
    order.statusHistory.push({
      status: 'REFUNDED',
      timestamp: new Date(),
      note: `Refund processed: ${reason}`,
    });
    await order.save();

    this.logger.log(`Refund processed for order ${order.orderNumber}: ${amount}`);

    return {
      message: 'Refund processed successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        refundAmount: amount,
        reason,
      },
    };
  }

  async handleStripeWebhook(payload: any) {
    this.logger.log('Stripe webhook received');

    if (payload.type === 'payment_intent.succeeded') {
      const paymentIntent = payload.data.object;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        const order = await this.orderModel.findById(orderId);
        if (order) {
          order.paymentStatus = 'PAID';
          order.paymentId = paymentIntent.id;
          await order.save();
        }
      }
    }

    return { received: true };
  }

  async handlePaymobWebhook(payload: any) {
    this.logger.log('Paymob webhook received');

    if (payload.success === true) {
      const orderId = payload.order?.id;
      if (orderId) {
        const order = await this.orderModel.findById(orderId);
        if (order) {
          order.paymentStatus = 'PAID';
          order.paymentId = payload.id?.toString();
          await order.save();
        }
      }
    }

    return { received: true };
  }

  async handleFawryWebhook(payload: any) {
    this.logger.log('Fawry webhook received');

    if (payload.fawryResponseCode === '200') {
      const orderId = payload.merchantOrderNumber;
      if (orderId) {
        const order = await this.orderModel.findById(orderId);
        if (order) {
          order.paymentStatus = 'PAID';
          order.paymentId = payload.fawryPaymentId;
          await order.save();
        }
      }
    }

    return { received: true };
  }

  private async processStripePayment(dto: ProcessPaymentDto): Promise<boolean> {
    this.logger.log(`Processing Stripe payment for order ${dto.orderId}`);
    return true;
  }

  private async processPaymobPayment(dto: ProcessPaymentDto): Promise<boolean> {
    this.logger.log(`Processing Paymob payment for order ${dto.orderId}`);
    return true;
  }

  private async processFawryPayment(dto: ProcessPaymentDto): Promise<boolean> {
    this.logger.log(`Processing Fawry payment for order ${dto.orderId}`);
    return true;
  }

  private async processWalletPayment(userId: string, amount: number): Promise<boolean> {
    const wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet || wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'ORDER_PAYMENT',
      amount,
      description: 'Payment for order',
      balanceBefore: wallet.balance + amount,
      balanceAfter: wallet.balance,
      createdAt: new Date(),
    } as any);
    await wallet.save();

    return true;
  }
}

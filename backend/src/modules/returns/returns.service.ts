import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReturnRequest, ReturnRequestDocument } from '../../database/schemas/return-request.schema';
import { ExchangeRequest, ExchangeRequestDocument } from '../../database/schemas/exchange-request.schema';
import { Refund, RefundDocument } from '../../database/schemas/refund.schema';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { Wallet, WalletDocument } from '../../database/schemas/wallet.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ReturnsService {
  private readonly logger = new Logger(ReturnsService.name);

  constructor(
    @InjectModel(ReturnRequest.name) private returnModel: Model<ReturnRequestDocument>,
    @InjectModel(ExchangeRequest.name) private exchangeModel: Model<ExchangeRequestDocument>,
    @InjectModel(Refund.name) private refundModel: Model<RefundDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
  ) {}

  async createReturnRequest(userId: string, orderId: string, items: any[], reason: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Only delivered orders can be returned');
    }

    let refundAmount = 0;
    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.medicine.toString() === item.medicine);
      if (orderItem) {
        refundAmount += orderItem.price * item.quantity;
      }
    }

    const returnRequest = await this.returnModel.create({
      order: orderId,
      user: userId,
      items,
      reason,
      refundAmount,
      status: 'PENDING',
      refundStatus: 'PENDING',
    });

    order.returnRequest = returnRequest._id;
    order.status = 'RETURNED';
    order.statusHistory.push({
      status: 'RETURNED',
      timestamp: new Date(),
      note: 'Return requested',
    });
    await order.save();

    this.logger.log(`Return request created for order ${order.orderNumber}`);

    return {
      message: 'Return request created',
      data: returnRequest,
    };
  }

  async getMyReturns(userId: string, query: PaginationDto) {
    const filter = { user: userId };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.returnModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('order', 'orderNumber')
        .exec(),
      this.returnModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Return requests retrieved',
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

  async getAllReturns(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.returnModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user', 'name email')
        .populate('order', 'orderNumber')
        .exec(),
      this.returnModel.countDocuments().exec(),
    ]);

    return {
      message: 'All return requests retrieved',
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

  async updateReturnStatus(id: string, status: string, adminNotes?: string) {
    const returnRequest = await this.returnModel.findById(id);
    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    returnRequest.status = status;
    if (adminNotes) {
      returnRequest.adminNotes = adminNotes;
    }

    if (status === 'COMPLETED') {
      returnRequest.refundStatus = 'COMPLETED';
    }

    await returnRequest.save();

    return {
      message: 'Return status updated',
      data: returnRequest,
    };
  }

  async createExchangeRequest(userId: string, orderId: string, originalItems: any[], replacementItems: any[], reason: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Only delivered orders can be exchanged');
    }

    let priceDifference = 0;
    for (const item of replacementItems) {
      priceDifference += (item.price || 0) * item.quantity;
    }
    for (const item of originalItems) {
      priceDifference -= (item.price || 0) * item.quantity;
    }

    const exchangeRequest = await this.exchangeModel.create({
      order: orderId,
      user: userId,
      originalItems,
      replacementItems,
      reason,
      priceDifference,
      status: 'PENDING',
    });

    order.exchangeRequest = exchangeRequest._id;
    order.status = 'EXCHANGED';
    order.statusHistory.push({
      status: 'EXCHANGED',
      timestamp: new Date(),
      note: 'Exchange requested',
    });
    await order.save();

    this.logger.log(`Exchange request created for order ${order.orderNumber}`);

    return {
      message: 'Exchange request created',
      data: exchangeRequest,
    };
  }

  async getMyExchanges(userId: string, query: PaginationDto) {
    const filter = { user: userId };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.exchangeModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('order', 'orderNumber')
        .exec(),
      this.exchangeModel.countDocuments(filter).exec(),
    ]);

    return {
      message: 'Exchange requests retrieved',
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

  async updateExchangeStatus(id: string, status: string, adminNotes?: string) {
    const exchangeRequest = await this.exchangeModel.findById(id);
    if (!exchangeRequest) {
      throw new NotFoundException('Exchange request not found');
    }

    exchangeRequest.status = status;
    if (adminNotes) {
      exchangeRequest.adminNotes = adminNotes;
    }

    await exchangeRequest.save();

    return {
      message: 'Exchange status updated',
      data: exchangeRequest,
    };
  }

  async processRefund(orderId: string, userId: string, amount: number, reason: string, refundMethod: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const refund = await this.refundModel.create({
      order: orderId,
      user: userId,
      amount,
      reason,
      refundMethod,
      status: 'PENDING',
    });

    if (refundMethod === 'WALLET') {
      let wallet = await this.walletModel.findOne({ user: userId });
      if (!wallet) {
        wallet = await this.walletModel.create({ user: userId, balance: 0, transactions: [] });
      }

      wallet.balance += amount;
      wallet.transactions.push({
        type: 'REFUND',
        amount,
        description: `Refund for order ${order.orderNumber}`,
        referenceId: orderId,
        referenceModel: 'Order',
        balanceBefore: wallet.balance - amount,
        balanceAfter: wallet.balance,
        createdAt: new Date(),
      } as any);
      await wallet.save();

      refund.status = 'COMPLETED';
      refund.processedAt = new Date();
      await refund.save();
    }

    order.refundRequest = refund._id;
    await order.save();

    this.logger.log(`Refund processed for order ${order.orderNumber}: ${amount}`);

    return {
      message: 'Refund processed',
      data: refund,
    };
  }

  async getAllRefunds(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.refundModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user', 'name email')
        .populate('order', 'orderNumber')
        .exec(),
      this.refundModel.countDocuments().exec(),
    ]);

    return {
      message: 'All refunds retrieved',
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

  async updateRefundStatus(id: string, status: string, adminId: string) {
    const refund = await this.refundModel.findById(id);
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = status;
    refund.processedBy = adminId as any;
    refund.processedAt = new Date();
    await refund.save();

    return {
      message: 'Refund status updated',
      data: refund,
    };
  }
}

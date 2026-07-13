import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet, WalletDocument } from '../../database/schemas/wallet.schema';
import { TopUpDto } from './dto/top-up.dto';
import { TransferDto } from './dto/transfer.dto';
import { DeductDto } from './dto/deduct.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
  ) {}

  async getBalance(userId: string) {
    let wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet) {
      wallet = await this.walletModel.create({ user: userId, balance: 0, transactions: [] });
    }

    return {
      message: 'Balance retrieved',
      data: {
        balance: wallet.balance,
        currency: wallet.currency,
      },
    };
  }

  async getTransactionHistory(userId: string, query: any) {
    const wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const transactions = wallet.transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice((page - 1) * limit, page * limit);

    return {
      message: 'Transaction history retrieved',
      data: {
        transactions,
        total: wallet.transactions.length,
        page,
        limit,
      },
    };
  }

  async topUp(userId: string, dto: TopUpDto) {
    let wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet) {
      wallet = await this.walletModel.create({ user: userId, balance: 0, transactions: [] });
    }

    const balanceBefore = wallet.balance;
    wallet.balance += dto.amount;
    wallet.transactions.push({
      type: 'TOP_UP',
      amount: dto.amount,
      description: dto.description || `Wallet top-up of ${dto.amount}`,
      balanceBefore,
      balanceAfter: wallet.balance,
      createdAt: new Date(),
    } as any);

    await wallet.save();

    this.logger.log(`Wallet top-up: ${userId} +${dto.amount}`);

    return {
      message: 'Wallet topped up successfully',
      data: {
        balance: wallet.balance,
        transaction: wallet.transactions[wallet.transactions.length - 1],
      },
    };
  }

  async deduct(userId: string, dto: DeductDto) {
    const wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const balanceBefore = wallet.balance;
    wallet.balance -= dto.amount;
    wallet.transactions.push({
      type: 'DEBIT',
      amount: dto.amount,
      description: dto.description || `Wallet deduction of ${dto.amount}`,
      balanceBefore,
      balanceAfter: wallet.balance,
      createdAt: new Date(),
    } as any);

    await wallet.save();

    this.logger.log(`Wallet deducted: ${userId} -${dto.amount}`);

    return {
      message: 'Amount deducted successfully',
      data: {
        balance: wallet.balance,
        transaction: wallet.transactions[wallet.transactions.length - 1],
      },
    };
  }

  async transfer(senderId: string, dto: TransferDto) {
    const senderWallet = await this.walletModel.findOne({ user: senderId });
    if (!senderWallet) {
      throw new NotFoundException('Sender wallet not found');
    }

    if (senderWallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    let receiverWallet = await this.walletModel.findOne({ user: dto.receiverId });
    if (!receiverWallet) {
      receiverWallet = await this.walletModel.create({ user: dto.receiverId, balance: 0, transactions: [] });
    }

    const senderBalanceBefore = senderWallet.balance;
    senderWallet.balance -= dto.amount;
    senderWallet.transactions.push({
      type: 'DEBIT',
      amount: dto.amount,
      description: dto.description || `Transfer to ${dto.receiverId}`,
      balanceBefore: senderBalanceBefore,
      balanceAfter: senderWallet.balance,
      createdAt: new Date(),
    } as any);

    const receiverBalanceBefore = receiverWallet.balance;
    receiverWallet.balance += dto.amount;
    receiverWallet.transactions.push({
      type: 'CREDIT',
      amount: dto.amount,
      description: dto.description || `Transfer from ${senderId}`,
      balanceBefore: receiverBalanceBefore,
      balanceAfter: receiverWallet.balance,
      createdAt: new Date(),
    } as any);

    await Promise.all([senderWallet.save(), receiverWallet.save()]);

    this.logger.log(`Wallet transfer: ${senderId} -> ${dto.receiverId}: ${dto.amount}`);

    return {
      message: 'Transfer successful',
      data: {
        senderBalance: senderWallet.balance,
        receiverBalance: receiverWallet.balance,
      },
    };
  }
}

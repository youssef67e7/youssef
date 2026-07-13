import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletService } from '../wallet.service';
import { Wallet } from '../../../database/schemas/wallet.schema';

describe('WalletService', () => {
  let service: WalletService;
  let walletModel: any;

  const mockWalletDocument = {
    _id: 'wallet123',
    user: 'user123',
    balance: 500,
    currency: 'EGP',
    transactions: [],
    isActive: true,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockWalletModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getModelToken(Wallet.name), useValue: mockWalletModel },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletModel = module.get(getModelToken(Wallet.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      walletModel.findOne.mockResolvedValue(mockWalletDocument);

      const result = await service.getBalance('user123');

      expect(result.data.balance).toBe(500);
      expect(result.data.currency).toBe('EGP');
    });

    it('should create wallet if not exists', async () => {
      walletModel.findOne.mockResolvedValue(null);
      walletModel.create.mockResolvedValue({ ...mockWalletDocument, balance: 0 });

      const result = await service.getBalance('user123');

      expect(result.data.balance).toBe(0);
      expect(walletModel.create).toHaveBeenCalled();
    });
  });

  describe('topUp', () => {
    it('should top up wallet successfully', async () => {
      walletModel.findOne.mockResolvedValue({ ...mockWalletDocument, balance: 500 });

      const result = await service.topUp('user123', { amount: 100, description: 'Test top-up' } as any);

      expect(result.message).toBe('Wallet topped up successfully');
      expect(result.data.balance).toBe(600);
    });

    it('should create wallet if not exists', async () => {
      walletModel.findOne.mockResolvedValue(null);
      walletModel.create.mockResolvedValue({ ...mockWalletDocument, balance: 0, transactions: [] });

      const result = await service.topUp('user123', { amount: 100 } as any);

      expect(result.message).toBe('Wallet topped up successfully');
      expect(walletModel.create).toHaveBeenCalled();
    });
  });

  describe('deduct', () => {
    it('should deduct from wallet successfully', async () => {
      const wallet = { ...mockWalletDocument, balance: 500, transactions: [] };
      walletModel.findOne.mockResolvedValue(wallet);

      const result = await service.deduct('user123', { amount: 100, description: 'Test deduction' } as any);

      expect(result.message).toBe('Amount deducted successfully');
      expect(result.data.balance).toBe(400);
    });

    it('should throw NotFoundException for non-existent wallet', async () => {
      walletModel.findOne.mockResolvedValue(null);

      await expect(service.deduct('nonexistent', { amount: 100 } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for insufficient balance', async () => {
      walletModel.findOne.mockResolvedValue({ ...mockWalletDocument, balance: 50 });

      await expect(service.deduct('user123', { amount: 100 } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('transfer', () => {
    it('should transfer between wallets', async () => {
      const senderWallet = { ...mockWalletDocument, balance: 500, transactions: [], save: jest.fn() };
      const receiverWallet = { ...mockWalletDocument, _id: 'wallet456', user: 'user456', balance: 200, transactions: [], save: jest.fn() };
      walletModel.findOne
        .mockResolvedValueOnce(senderWallet)
        .mockResolvedValueOnce(receiverWallet);

      const result = await service.transfer('user123', { receiverId: 'user456', amount: 100 } as any);

      expect(result.message).toBe('Transfer successful');
      expect(senderWallet.save).toHaveBeenCalled();
      expect(receiverWallet.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent sender', async () => {
      walletModel.findOne.mockResolvedValue(null);

      await expect(service.transfer('nonexistent', { receiverId: 'user456', amount: 100 } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for insufficient balance', async () => {
      walletModel.findOne.mockResolvedValue({ ...mockWalletDocument, balance: 50 });

      await expect(service.transfer('user123', { receiverId: 'user456', amount: 100 } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transactions', async () => {
      const wallet = {
        ...mockWalletDocument,
        transactions: [
          { type: 'TOP_UP', amount: 100, createdAt: new Date() },
          { type: 'DEBIT', amount: 50, createdAt: new Date() },
        ],
      };
      walletModel.findOne.mockResolvedValue(wallet);

      const result = await service.getTransactionHistory('user123', { page: 1, limit: 10 });

      expect(result.data.transactions).toBeDefined();
      expect(result.data.total).toBe(2);
    });

    it('should throw NotFoundException for non-existent wallet', async () => {
      walletModel.findOne.mockResolvedValue(null);

      await expect(service.getTransactionHistory('nonexistent', { page: 1, limit: 10 })).rejects.toThrow(NotFoundException);
    });
  });
});

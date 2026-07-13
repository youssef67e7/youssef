import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { Order } from '../../../database/schemas/order.schema';
import { Wallet } from '../../../database/schemas/wallet.schema';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let orderModel: any;
  let walletModel: any;

  const mockOrder = {
    _id: 'order123',
    orderNumber: 'PW-2026-001',
    total: 500,
    paymentStatus: 'PENDING',
    paymentMethod: 'STRIPE',
    paymentId: null,
    status: 'PENDING',
    user: 'user123',
    statusHistory: [],
    save: jest.fn().mockResolvedValue(true),
  };

  const mockOrderModel = {
    findById: jest.fn(),
  };

  const mockWalletModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Wallet.name), useValue: mockWalletModel },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    orderModel = module.get(getModelToken(Order.name));
    walletModel = module.get(getModelToken(Wallet.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);

      const result = await service.createPaymentIntent({ orderId: 'order123' } as any);

      expect(result.message).toBe('Payment intent created');
      expect(result.data).toHaveProperty('clientSecret');
      expect(result.data.amount).toBe(500);
    });

    it('should throw NotFoundException for non-existent order', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(service.createPaymentIntent({ orderId: 'nonexistent' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for already paid order', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, paymentStatus: 'PAID' });

      await expect(service.createPaymentIntent({ orderId: 'order123' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('processPayment', () => {
    it('should process a COD payment', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, statusHistory: [] });

      const result = await service.processPayment({
        orderId: 'order123',
        paymentMethod: 'CASH_ON_DELIVERY',
      } as any);

      expect(result.message).toBe('Payment processed successfully');
      expect(result.data.status).toBe('PAID');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(service.processPayment({
        orderId: 'nonexistent',
        paymentMethod: 'STRIPE',
      } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for already paid order', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, paymentStatus: 'PAID' });

      await expect(service.processPayment({
        orderId: 'order123',
        paymentMethod: 'STRIPE',
      } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid payment method', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, statusHistory: [] });

      await expect(service.processPayment({
        orderId: 'order123',
        paymentMethod: 'INVALID',
      } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyPayment', () => {
    it('should verify a paid payment', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, paymentStatus: 'PAID' });

      const result = await service.verifyPayment('order123');

      expect(result.message).toBe('Payment verified');
      expect(result.data.verified).toBe(true);
    });

    it('should not verify an unpaid payment', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, paymentStatus: 'PENDING' });

      const result = await service.verifyPayment('order123');

      expect(result.message).toBe('Payment not verified');
      expect(result.data.verified).toBe(false);
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(service.verifyPayment('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      orderModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.getPaymentStatus('order123');

      expect(result.message).toBe('Payment status retrieved');
      expect(result.data.paymentStatus).toBe('PENDING');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      orderModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getPaymentStatus('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processRefund', () => {
    it('should process a refund', async () => {
      orderModel.findById.mockResolvedValue({
        ...mockOrder,
        paymentStatus: 'PAID',
        statusHistory: [],
      });

      const result = await service.processRefund('order123', 200, 'Customer request');

      expect(result.message).toBe('Refund processed successfully');
      expect(result.data.refundAmount).toBe(200);
    });

    it('should throw NotFoundException for non-existent order', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(service.processRefund('nonexistent', 200, 'reason')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unpaid order', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, paymentStatus: 'PENDING' });

      await expect(service.processRefund('order123', 200, 'reason')).rejects.toThrow(BadRequestException);
    });
  });
});

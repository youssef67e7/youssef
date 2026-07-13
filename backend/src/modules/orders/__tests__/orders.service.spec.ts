import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from '../orders.service';
import { Order } from '../../../database/schemas/order.schema';
import { Cart } from '../../../database/schemas/cart.schema';
import { Medicine } from '../../../database/schemas/medicine.schema';
import { Coupon } from '../../../database/schemas/coupon.schema';
import { Invoice } from '../../../database/schemas/invoice.schema';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: any;
  let cartModel: any;
  let medicineModel: any;
  let couponModel: any;
  let invoiceModel: any;

  const mockOrder = {
    _id: 'order123',
    orderNumber: 'PW-2026-001',
    user: 'user123',
    items: [{ medicine: 'med123', quantity: 2, price: 25, total: 50 }],
    subtotal: 50,
    total: 50,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: 'CASH_ON_DELIVERY',
    deletedAt: null,
    statusHistory: [],
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({ _id: 'order123' }),
  };

  const mockOrderModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockCartModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const mockMedicineModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockCouponModel = {
    findOne: jest.fn(),
  };

  const mockInvoiceModel = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Cart.name), useValue: mockCartModel },
        { provide: getModelToken(Medicine.name), useValue: mockMedicineModel },
        { provide: getModelToken(Coupon.name), useValue: mockCouponModel },
        { provide: getModelToken(Invoice.name), useValue: mockInvoiceModel },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get(getModelToken(Order.name));
    cartModel = module.get(getModelToken(Cart.name));
    medicineModel = module.get(getModelToken(Medicine.name));
    couponModel = module.get(getModelToken(Coupon.name));
    invoiceModel = module.get(getModelToken(Invoice.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      shippingAddress: { street: '123 Main', city: 'Cairo', state: 'Cairo', zipCode: '12345' },
      paymentMethod: 'CASH_ON_DELIVERY',
    };

    it('should create a new order from cart', async () => {
      cartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          items: [{ medicine: 'med123', quantity: 2 }],
        }),
      });
      medicineModel.findById.mockResolvedValue({
        _id: 'med123', name: 'Para', price: 25, stockQuantity: 100,
        isActive: true, deletedAt: null, sku: 'P1', images: [],
      });
      orderModel.create.mockResolvedValue({ ...mockOrder, orderNumber: 'PW-001' });
      mockInvoiceModel.create.mockResolvedValue({ _id: 'inv1' });

      const result = await service.create('user123', dto as any);

      expect(result.message).toBe('Order created successfully');
      expect(orderModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty cart', async () => {
      cartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({ items: [] }),
      });

      await expect(service.create('user123', dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for inactive medicine', async () => {
      cartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          items: [{ medicine: 'med123', quantity: 2 }],
        }),
      });
      medicineModel.findById.mockResolvedValue({
        _id: 'med123', isActive: false, deletedAt: null, stockQuantity: 100,
      });

      await expect(service.create('user123', dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockOrder]),
      };
      orderModel.find.mockReturnValue(chain);
      orderModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.findAll({ page: 1, limit: 10 } as any);

      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should return order by id', async () => {
      const chain = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrder),
      };
      orderModel.findById.mockReturnValue(chain);

      const result = await service.findById('order123');

      expect(result.message).toBe('Order retrieved successfully');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      const chain = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      orderModel.findById.mockReturnValue(chain);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      orderModel.findById.mockResolvedValue({ ...mockOrder, statusHistory: [] });

      const result = await service.updateStatus('order123', { status: 'CONFIRMED' } as any, 'admin123');

      expect(result.message).toBe('Order status updated');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(service.updateStatus('nonexistent', { status: 'CONFIRMED' } as any, 'admin123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a pending order', async () => {
      orderModel.findById.mockResolvedValue({
        ...mockOrder,
        status: 'PENDING',
        items: [{ medicine: 'med123', quantity: 2 }],
        statusHistory: [],
      });

      const result = await service.cancelOrder('order123', 'user123', 'No longer needed');

      expect(result.message).toBe('Order cancelled successfully');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(service.cancelOrder('nonexistent', 'user123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-owner', async () => {
      orderModel.findById.mockResolvedValue({
        ...mockOrder, user: 'other-user', status: 'PENDING',
      });

      await expect(service.cancelOrder('order123', 'user123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete an order', async () => {
      orderModel.findById.mockResolvedValue(mockOrder);
      orderModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.softDelete('order123', 'admin123');

      expect(result.message).toBe('Order deleted successfully');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      orderModel.findById.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent', 'admin123')).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CouponsService } from '../coupons.service';
import { Coupon } from '../../../database/schemas/coupon.schema';

describe('CouponsService', () => {
  let service: CouponsService;
  let couponModel: any;

  const mockCoupon = {
    _id: 'coupon123',
    code: 'WELCOME10',
    name: 'Welcome Discount',
    type: 'PERCENTAGE',
    discountValue: 10,
    minimumOrderAmount: 200,
    maximumDiscountAmount: 50,
    usageLimit: 100,
    usedCount: 10,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isActive: true,
    deletedAt: null,
    save: jest.fn(),
    toObject: jest.fn(),
  };

  const mockCouponModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: getModelToken(Coupon.name), useValue: mockCouponModel },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    couponModel = module.get(getModelToken(Coupon.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = { code: 'WELCOME10', name: 'Welcome', type: 'PERCENTAGE', discountValue: 10, startDate: '2026-01-01', endDate: '2026-12-31' };

    it('should create a coupon successfully', async () => {
      couponModel.findOne.mockResolvedValue(null);
      couponModel.create.mockResolvedValue({ ...mockCoupon });

      const result = await service.create(dto as any, 'admin123');

      expect(result.message).toBe('Coupon created successfully');
      expect(couponModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for duplicate code', async () => {
      couponModel.findOne.mockResolvedValue(mockCoupon);

      await expect(service.create(dto as any, 'admin123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('validate', () => {
    it('should validate a valid coupon', async () => {
      couponModel.findOne.mockResolvedValue({
        ...mockCoupon,
        type: 'PERCENTAGE',
        discountValue: 10,
        maximumDiscountAmount: 50,
      });

      const result = await service.validate('WELCOME10', 500, 'user123');

      expect(result.message).toBe('Coupon is valid');
      expect(result.data.discount).toBe(50);
    });

    it('should throw NotFoundException for non-existent coupon', async () => {
      couponModel.findOne.mockResolvedValue(null);

      await expect(service.validate('INVALID', 500, 'user123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for expired coupon', async () => {
      couponModel.findOne.mockResolvedValue({
        ...mockCoupon,
        endDate: new Date('2025-01-01'),
      });

      await expect(service.validate('WELCOME10', 500, 'user123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException below minimum order', async () => {
      couponModel.findOne.mockResolvedValue(mockCoupon);

      await expect(service.validate('WELCOME10', 50, 'user123')).rejects.toThrow(BadRequestException);
    });

    it('should calculate fixed discount correctly', async () => {
      couponModel.findOne.mockResolvedValue({
        ...mockCoupon,
        type: 'FIXED',
        discountValue: 100,
        maximumDiscountAmount: 100,
      });

      const result = await service.validate('WELCOME10', 500, 'user123');

      expect(result.data.discount).toBe(100);
    });
  });

  describe('findAll', () => {
    it('should return paginated coupons', async () => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCoupon]),
      };
      couponModel.find.mockReturnValue(chain);
      couponModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.findAll({ page: 1, limit: 10 } as any);

      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete a coupon', async () => {
      couponModel.findById.mockResolvedValue(mockCoupon);
      couponModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.remove('coupon123', 'admin123');

      expect(result.message).toBe('Coupon deleted successfully');
    });

    it('should throw NotFoundException for non-existent coupon', async () => {
      couponModel.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'admin123')).rejects.toThrow(NotFoundException);
    });
  });
});
